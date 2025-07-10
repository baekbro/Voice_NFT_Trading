from flask import Flask, request, send_file, jsonify
from transformers import AutoTokenizer
from datetime import datetime
from flask_cors import CORS
import os
import torch
import soundfile as sf
import platform
from pydub import AudioSegment
from flask import send_from_directory
import tempfile

from cli.SparkTTS import SparkTTS
from sparktts.utils.token_parser import LEVELS_MAP_UI

app = Flask(__name__)
CORS(app)

if platform.system() == "Darwin":
    device = torch.device("mps:0")
elif torch.cuda.is_available():
    device = torch.device("cuda:0")
else:
    device = torch.device("cpu")

print(f"디바이스 설정 완료: {device}")

model_dir = "pretrained_models/Spark-TTS-0.5B"
print("SparkTTS 모델 초기화 시작...")
try:
    model = SparkTTS(model_dir, device)
    print("SparkTTS 모델 초기화 성공")
except Exception as e:
    print(f"SparkTTS 모델 초기화 실패: {e}")
    exit(1)

SAVE_DIR = "example/results"
PROMPT_DIR = "example/prompts"
os.makedirs(SAVE_DIR, exist_ok=True)
os.makedirs(PROMPT_DIR, exist_ok=True)

def generate_tts(user_id, text, gender=None, pitch=None, speed=None):
    prompt_path = os.path.join(PROMPT_DIR, f"{user_id}.wav")
    if not os.path.exists(prompt_path):
        raise FileNotFoundError(f"User ID `{user_id}`에 대한 프롬프트 음성이 존재하지 않습니다.")

    with torch.no_grad():
        print(f"TTS 생성 시작... [user_id: {user_id}]")
        wav = model.inference(text, prompt_path, gender, pitch, speed)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        user_dir = os.path.join(SAVE_DIR, user_id)
        os.makedirs(user_dir, exist_ok=True)
        save_path = os.path.join(user_dir, f"{timestamp}.wav")
        sf.write(save_path, wav, samplerate=16000)
        print(f"TTS 생성 완료: {save_path}")
        return save_path

@app.route("/upload-prompt", methods=["POST"])
def upload_prompt():
    user_id = request.form.get("user_id")
    prompt_speech = request.files.get("prompt_speech")

    if not user_id or not prompt_speech:
        return jsonify({"error": "user_id와 prompt_speech는 필수입니다."}), 400

    prompt_path = os.path.join(PROMPT_DIR, f"{user_id}.wav")

    # if os.path.exists(prompt_path):
    #     return jsonify({"error": "이미 프롬프트 음성이 등록되어 있습니다."}), 409

    with tempfile.NamedTemporaryFile(delete=False, suffix=".tmp") as tmp:
        tmp_path = tmp.name
        prompt_speech.save(tmp_path)

    audio = AudioSegment.from_file(tmp_path)
    audio = audio.set_channels(1).set_frame_rate(16000)
    audio.export(prompt_path, format="wav", codec="pcm_s16le")

    os.remove(tmp_path)
    print(f"[{user_id}] 프롬프트 저장 및 변환 완료: {prompt_path}")
    return jsonify({"message": "프롬프트 음성이 성공적으로 저장되었습니다."})

@app.route("/voice-clone", methods=["POST"])
def voice_clone():
    user_id = request.form.get("user_id")
    text = request.form.get("text")

    if not user_id or not text:
        return jsonify({"error": "user_id와 text는 필수입니다."}), 400

    try:
        output_path = generate_tts(user_id, text)
        filename = os.path.basename(output_path)

        # 파일명을 헤더에 포함하여 전송
        response = send_file(
            output_path,
            mimetype="audio/wav",
            as_attachment=True,
            download_name=filename
        )
        
        # 파일명을 헤더에 추가
        response.headers['X-Filename'] = filename
        response.headers['X-Filepath'] = output_path
        
        return response

    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    
@app.route('/results/<user_id>/<filename>')
def serve_generated_audio(user_id, filename):
    path = os.path.join(SAVE_DIR, user_id)
    return send_from_directory(path, filename)

@app.route('/file/<path:file_path>')
def serve_file_by_path(file_path):
    """파일 경로로 파일을 제공하는 엔드포인트"""
    try:
        # 보안을 위해 SAVE_DIR 내의 파일만 접근 가능하도록 제한
        full_path = os.path.join(SAVE_DIR, file_path)
        if not os.path.abspath(full_path).startswith(os.path.abspath(SAVE_DIR)):
            return jsonify({"error": "접근할 수 없는 경로입니다."}), 403
        
        if not os.path.exists(full_path):
            return jsonify({"error": "파일을 찾을 수 없습니다."}), 404
            
        directory = os.path.dirname(full_path)
        filename = os.path.basename(full_path)
        return send_from_directory(directory, filename)
        
    except Exception as e:
        return jsonify({"error": f"파일 제공 중 오류가 발생했습니다: {str(e)}"}), 500
    
    
@app.route("/voice-list", methods=["POST"])
def voice_list():
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "user_id는 필수입니다."}), 400

    user_dir = os.path.join(SAVE_DIR, user_id)

    if not os.path.exists(user_dir):
        return jsonify({"voices": []})

    files = sorted(
        [f for f in os.listdir(user_dir) if f.endswith(".wav")],
        reverse=True
    )

    file_urls = [f"/static/results/{user_id}/{f}" for f in files]

    return jsonify({"voices": file_urls})

if __name__ == "__main__":
    print("Flask 서버 시작 중…")
    app.run(host="0.0.0.0", port=5000)