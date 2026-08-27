from flask import Flask, request, jsonify, send_from_directory
from diffusers import StableDiffusionPipeline
import torch
import os
import uuid


app = Flask(__name__)


MODEL_ID = "stable-diffusion-v1-5/stable-diffusion-v1-5"


print("===================================")
print("Starting Local Image Generator")
print("===================================")


if torch.cuda.is_available():

    DEVICE = "cuda"

    print("CUDA GPU detected")

    pipe = StableDiffusionPipeline.from_pretrained(
        MODEL_ID,
        torch_dtype=torch.float16
    )

else:

    DEVICE = "cpu"

    print("No CUDA GPU detected")
    print("Using CPU")

    pipe = StableDiffusionPipeline.from_pretrained(
        MODEL_ID,
        torch_dtype=torch.float32
    )


pipe = pipe.to(DEVICE)


print("Stable Diffusion model loaded")
print("Device:", DEVICE)


OUTPUT_DIR = os.path.join(
    os.path.dirname(__file__),
    "generated"
)


os.makedirs(
    OUTPUT_DIR,
    exist_ok=True
)


@app.route(
    "/health",
    methods=["GET"]
)
def health():

    return jsonify({

        "success": True,

        "message":
            "Local image generator is running",

        "device":
            DEVICE

    })


@app.route(
    "/generate",
    methods=["POST"]
)
def generate():

    try:

        data = request.get_json()


        prompt = data.get(
            "prompt",
            ""
        )


        if not prompt:

            return jsonify({

                "success": False,

                "message":
                    "Prompt is required"

            }), 400


        print()
        print("Generating image...")
        print("Prompt:", prompt)


        image = pipe(

            prompt=prompt,

            negative_prompt="""
            blurry, low quality, distorted,
            duplicate objects, watermark,
            unwanted text, bad anatomy
            """,
num_inference_steps=10,
        guidance_scale=7.0,
        width=512,
        height=512

        ).images[0]


        file_name = (
            f"scene-{uuid.uuid4().hex}.png"
        )


        file_path = os.path.join(

            OUTPUT_DIR,

            file_name

        )


        image.save(
            file_path
        )


        print(
            "Image saved:",
            file_path
        )


        return jsonify({

            "success": True,

            "fileName":
                file_name,

            "filePath":
                file_path

        })


    except Exception as error:

        print(
            "Image generation error:",
            error
        )


        return jsonify({

            "success": False,

            "message":
                str(error)

        }), 500

@app.route("/generated/<filename>")
def get_generated_image(filename):

    return send_from_directory(
        "generated",
        filename
    )
if __name__ == "__main__":

    app.run(

        host="127.0.0.1",

        port=7860,

        debug=False

    )