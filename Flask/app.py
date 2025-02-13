from flask import Flask, request, jsonify
from PIL import Image
from flask_cors import CORS
import torch
from transformers import GPT2Tokenizer, GPT2LMHeadModel, AutoImageProcessor, AutoModelForImageClassification

app = Flask(__name__)
CORS(app)

# Model paths for both image classification and recipe generation
image_model_path = "illusion002/food-image-classification"  # Update to the correct model path if local
recipe_model_path = "Shresthadev403/controlled-food-recipe-generation"  # Update to the correct model path if local

# Load image classification model
processor = AutoImageProcessor.from_pretrained(image_model_path)
image_model = AutoModelForImageClassification.from_pretrained(image_model_path)

# Load pre-trained GPT-2 model for recipe generation
recipe_tokenizer = GPT2Tokenizer.from_pretrained("./controlled-food-recipe-generation")
recipe_model = GPT2LMHeadModel.from_pretrained('./controlled-food-recipe-generation')

recipe_tokenizer.add_special_tokens({'additional_special_tokens': ['<RECIPE_END>', '<INPUT_START>', '<INSTR_START>']})
recipe_model.resize_token_embeddings(len(recipe_tokenizer))  # Resize embeddings to include new tokens

def convert_tokens_to_string(tokens):
    """
    Converts a sequence of tokens (string) into a single string.
    """
    if tokens is None:
        return ""
    
    cleaned_tokens = [token for token in tokens if token is not None]
    text = recipe_tokenizer.decode(cleaned_tokens, skip_special_tokens=True) if cleaned_tokens else ""
    return text

def generate_text(prompt):
    # Set the custom EOS token ID in the model configuration
    custom_eos_token_id = recipe_tokenizer.encode('<RECIPE_END>', add_special_tokens=False)[0]
    recipe_model.config.eos_token_id = custom_eos_token_id

    recipe_model.eval()

    # Tokenize the input prompt
    input_ids = recipe_tokenizer.encode(prompt, return_tensors='pt')
    attention_mask = torch.ones_like(input_ids)

    # Generate the recipe text
    output = recipe_model.generate(input_ids=input_ids, attention_mask=attention_mask, max_length=500, num_return_sequences=1, eos_token_id=custom_eos_token_id)


    generated_text = recipe_tokenizer.decode(output[0], skip_special_tokens=True)
    # Convert tokens to string
    generated_text = generated_text.replace('<INPUT_START>', '').replace('<INSTR_START>', '')

    # Add newlines before each special token for readability
    generated_text = generated_text.replace('<', '\n<')

    # Post-process and clean the generated text
    return generated_text



@app.route('/generate_recipe', methods=['POST'])
def generate_recipe():
    data = request.json
    prompt = data['dishName']
    full_prompt = f"Provide a step-by-step recipe to make {prompt} "
    print(f"Generating recipe for: {prompt}")

    # Generate text using the fine-tuned model
    generated_text = generate_text(full_prompt)

    # Ensure to return structured content
    return jsonify({'generated_text': generated_text})

@app.route('/classify', methods=['POST'])
def classify_image():
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400
    
    image_file = request.files['image']
    try:
        image = Image.open(image_file).convert('RGB').resize((224, 224))
        inputs = processor(images=image, return_tensors="pt")
        
        # Classify the image
        with torch.no_grad():
            outputs = image_model(**inputs)
        predicted_index = torch.argmax(outputs.logits, dim=-1).item()

        class_labels = image_model.config.id2label
        predicted_label = class_labels.get(predicted_index, "Unknown Dish")

        return jsonify({'dishName': predicted_label})
    
    except Exception as e:
        return jsonify({'error': f'Failed to process image: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
