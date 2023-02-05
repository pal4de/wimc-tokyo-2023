### Linux 環境でのセットアップ

```:bash
sudo setcap cap_net_raw+eip $(eval readlink -f `which node`) # nodeにbluetooth関連の権限付与
sudo raspi-config nonint do_spi 0 # LED用にSPIの有効化
sudo apt -y update
sudo apt -y install python2 bluetooth bluez libbluetooth-dev libudev-dev
sudo npm install -g pnpm
echo 'dtoverlay=pwm-2chan,pin=12,func=4,pin2=13,func2=4' | sudo tee /boot/config.txt -a
```

### 実行方法

```:bash
sudo NOBLE_MULTI_ROLE=1 node controller/
```

# 測距センサーと圧電スピーカー

# PWM 設定

## 必要な設定

以下のコマンドで、GPIO12 と GPIO13 の PWM 出力を有効化する。

```(bash)
sudo dtoverlay pwm-2chan pin=12 func=4 pin2=13 func2=4
```

以下のコマンドで、`device`、`export`、`npwm`、`power`、`subsystem`、`uevent`、`unexport`が表示されることを確認する。

```(bash)
ls /sys/class/pwm/pwmchip0
```

以下のコマンドで、PWM を有効化する。

```(bash)
echo 0 > /sys/class/pwm/pwmchip0/export
echo 1 > /sys/class/pwm/pwmchip0/export
```

以下のコマンドで、`pwm0`、`pwm1`が表示されることを確認する。

```(bash)
ls /sys/class/pwm/pwmchip0
```

以下のコマンドで、`capture`、`duty_cycle`、`enable`、`period`、`polarity`、`power`、`uevent`が表示されることを確認する。

```(bash)
ls /sys/class/pwm/pwmchip0/pwm1
```

## 動作確認

以下コマンドで、周期を 20ms に設定する。

```(bash)
echo 20000000 > /sys/class/pwm/pwmchip0/pwm1/period
```

以下コマンドで、パルス幅を 10ms に設定する。

```(bash)
echo 10000000 > /sys/class/pwm/pwmchip0/pwm1/duty_cycle
```

以下コマンドで、出力を開始する。

```(bash)
echo 1 > /sys/class/pwm/pwmchip0/pwm1/enable
```

以下コマンドで、出力を停止する。

```(bash)
echo 0 > /sys/class/pwm/pwmchip0/pwm1/enable
```
