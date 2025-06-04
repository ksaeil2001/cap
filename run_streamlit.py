#!/usr/bin/env python3
"""
Streamlit 애플리케이션 실행 스크립트
"""

import subprocess
import sys
import os

def run_streamlit():
    """Streamlit 애플리케이션을 실행합니다."""
    try:
        # Streamlit 앱 실행
        cmd = [
            sys.executable, "-m", "streamlit", "run", "app.py",
            "--server.port", "8501",
            "--server.address", "0.0.0.0",
            "--server.headless", "true"
        ]
        
        print("🚀 Streamlit 애플리케이션을 시작합니다...")
        print("📱 URL: http://0.0.0.0:8501")
        
        subprocess.run(cmd, check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Streamlit 실행 중 오류 발생: {e}")
        sys.exit(1)
    except KeyboardInterrupt:
        print("\n⏹️ 애플리케이션이 중단되었습니다.")
        sys.exit(0)

if __name__ == "__main__":
    run_streamlit()