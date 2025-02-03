from flask import Flask, request, jsonify
from PIL import Image
from flask_cors import CORS
import torch
import re
from collections import OrderedDict
from transformers import (
    AutoImageProcessor, AutoModelForImageClassification,
    GPT2Tokenizer, GPT2LMHeadModel,
)
import os

app = Flask(__name__)
CORS(app)

# Load image classification model
processor = AutoImageProcessor.from_pretrained("illusion002/food-image-classification")
image_model = AutoModelForImageClassification.from_pretrained("illusion002/food-image-classification")

# Load pre-trained GPT-2 model for recipe generation
model_name = "Shresthadev403/controlled-food-recipe-generation"
recipe_model = GPT2LMHeadModel.from_pretrained(model_name)
recipe_tokenizer = GPT2Tokenizer.from_pretrained(model_name)
recipe_tokenizer.pad_token = recipe_tokenizer.eos_token

@app.route('/classify', methods=['POST'])
def classify_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    image_file = request.files['image']
    try:
        image = Image.open(image_file).convert('RGB').resize((224, 224))
        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = image_model(**inputs)
        predicted_index = torch.argmax(outputs.logits, dim=-1).item()

        # Assuming you have a list of class labels for the food items
        class_labels = image_model.config.id2label
        predicted_label = class_labels.get(predicted_index, "Unknown Dish")

        return jsonify({'dishName': predicted_label})
    except Exception as e:
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500

@app.route('/generate_recipe', methods=['POST'])
def generate_recipe():
    data = request.get_json()
    dish_name = data.get('dishName', '')
    if not dish_name:
        return jsonify({'error': 'No dish name provided'}), 400
    try:
        input_text = f"Generate a full step-by-step recipe for {dish_name}."
        inputs = recipe_tokenizer(input_text, return_tensors="pt", padding=True, truncation=True)
        outputs = recipe_model.generate(
            **inputs, 
            max_length=600,
            num_return_sequences=1,
            do_sample=True,
            temperature=0.9,
            top_p=0.95,
            repetition_penalty=1.2,  # Reduces duplicate phrases
            no_repeat_ngram_size=3    # Prevents 3-word repeats
        )
        recipe = recipe_tokenizer.decode(outputs[0], skip_special_tokens=True)

        # Format the recipe output
        formatted_recipe = format_recipe(recipe)

        return jsonify({'recipe': formatted_recipe})
    except Exception as e:
        return jsonify({'error': str(e)}), 500



def format_recipe(recipe):
    # Clean up raw text
    recipe = re.sub(r'<[^>]+>', '', recipe)  # Remove all HTML-like tags
    recipe = re.sub(r'\s+', ' ', recipe).strip()  # Collapse whitespace

    formatted = {
        'Title': '',
        'Ingredients': [],
        'Instructions': []
    }

    # Extract title using the initial prompt
    title_match = re.search(r'Generate a full step-by-step recipe for (.*?)\.', recipe)
    if title_match:
        formatted['Title'] = title_match.group(1).title()

    # Split into sections using common keywords
    sections = re.split(r'(ingredients:|instructions:|steps:|method:)', recipe, flags=re.IGNORECASE)
    
    # Process ingredients
    ingredients_section = ''
    if len(sections) > 1:
        for i, section in enumerate(sections):
            if section.lower() in ['ingredients:', 'ingredients']:
                ingredients_section = sections[i+1]
                break

    # Extract ingredients with measurement validation
    ingredients = []
    for line in ingredients_section.split('.'):
        line = line.strip()
        if line and any(c.isalpha() for c in line):
            # Normalize measurements
            line = re.sub(r'(\d+)\s*([fl]?oz)', lambda m: f"{m.group(1)}{m.group(2)}", line)
            ingredients.append(line.capitalize())

    # Deduplicate and clean ingredients
    seen = set()
    formatted['Ingredients'] = [
        x for x in ingredients 
        if x and not (x.lower() in seen or seen.add(x.lower()))
    ]

    # Process instructions
    instructions_section = ''
    if len(sections) > 1:
        for i, section in enumerate(sections):
            if section.lower() in ['instructions:', 'steps:', 'method:']:
                instructions_section = sections[i+1]
                break

    # Split and clean instructions
    instructions = []
    current_step = []
    for char in instructions_section:
        if char == '.':
            step = ''.join(current_step).strip()
            if step and len(step.split()) > 3:  # Filter out short fragments
                instructions.append(step.capitalize() + '.')
            current_step = []
        else:
            current_step.append(char)

    # Add the last step if incomplete
    if current_step:
        step = ''.join(current_step).strip()
        if step and len(step.split()) > 3:
            instructions.append(step.capitalize())

    # Deduplicate and clean instructions
    seen_steps = set()
    formatted['Instructions'] = [
        step for step in instructions 
        if step and not (step.lower() in seen_steps or seen_steps.add(step.lower()))
    ]

    # Fallback if no sections found
    if not formatted['Ingredients'] or not formatted['Instructions']:
        return format_recipe_fallback(recipe)
    
    return formatted

def format_recipe_fallback(recipe):
    lines = [line.strip() for line in recipe.split('.') if line.strip()]
    formatted = {
        'Title': 'Delicious Recipe',
        'Ingredients': [],
        'Instructions': []
    }

    current_section = None
    for line in lines:
        if re.search(r'ingredient', line, re.IGNORECASE):
            current_section = 'Ingredients'
        elif re.search(r'instruct|step|method', line, re.IGNORECASE):
            current_section = 'Instructions'
        elif current_section:
            line = line.capitalize()
            if current_section == 'Ingredients' and any(c.isdigit() for c in line):
                formatted['Ingredients'].append(line)
            elif current_section == 'Instructions' and len(line.split()) > 3:
                formatted['Instructions'].append(line)

    # Deduplicate and clean
    formatted['Ingredients'] = list(dict.fromkeys(formatted['Ingredients']))
    formatted['Instructions'] = list(dict.fromkeys(formatted['Instructions']))
    
    return formatted
    
    return formatted
if __name__ == '__main__':
    app.run(debug=True)
