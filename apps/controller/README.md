### Linux 環境でのセットアップ

```:bash
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`) # nodeにbluetooth関連の権限付与
sudo raspi-config nonint do_spi 0 # LED用にSPIの有効化
sudo apt -y update
sudo apt -y install python2 bluetooth bluez libbluetooth-dev libudev-dev
sudo npm install -g pnpm
```

### 実行方法

```:bash
sudo NOBLE_MULTI_ROLE=1 node controller/
```
