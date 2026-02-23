from flask import Flask, jsonify
import subprocess
import os

app = Flask(__name__)
vpn_process = None

@app.route('/start')
def start_vpn():
    global vpn_process
    config = request.args.get('config', 'netherlands.ovpn')
    
    # Путь к OpenVPN и конфигам
    vpn_path = 'C:\\Program Files\\OpenVPN\\bin\\openvpn.exe'
    config_path = f'C:\\vpn_configs\\{config}'
    
    if os.path.exists(config_path):
        vpn_process = subprocess.Popen([vpn_path, '--config', config_path])
        return jsonify({'status': 'connected', 'config': config})
    return jsonify({'status': 'error', 'message': 'Config not found'})

@app.route('/stop')
def stop_vpn():
    global vpn_process
    if vpn_process:
        vpn_process.terminate()
        vpn_process = None
        return jsonify({'status': 'disconnected'})
    return jsonify({'status': 'no active connection'})

if __name__ == '__main__':
    app.run(port=8080)