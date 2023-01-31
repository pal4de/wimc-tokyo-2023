### Linux 環境でのセットアップ

```:bash
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`) # nodeにbluetooth関連の権限付与
sudo apt -y update
sudo apt -y install python2 bluetooth bluez libbluetooth-dev libudev-dev
sudo npm install -g pnpm
```
