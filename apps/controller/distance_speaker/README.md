# PWM設定

## 必要な設定

以下のコマンドで、GPIO12とGPIO13のPWM出力を有効化する。

```(bash)
sudo dtoverlay pwm-2chan pin=12 func=4 pin2=13 func2=4
```

以下のコマンドで、`device`、`export`、`npwm`、`power`、`subsystem`、`uevent`、`unexport`が表示されることを確認する。

```(bash)
ls /sys/class/pwm/pwmchip0
```

以下のコマンドで、PWMを有効化する。

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

以下コマンドで、周期を20msに設定する。

```(bash)
echo 20000000 > /sys/class/pwm/pwmchip0/pwm1/period
```

以下コマンドで、パルス幅を10msに設定する。

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
