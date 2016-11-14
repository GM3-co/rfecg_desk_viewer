RF-ECG Desk Viewer
====

**※本システムはelectron-[Quick Start Guide](http://electron.atom.io/docs/latest/tutorial/quick-start)をベースに作成しています。**

RF-ECG Desk Viewerは[RF-ECG IoT Bridge](http://gm3.jp)のデータを表示するデスクトップ版サンプルプログラムです。  
WEB版は[RF-ECG WEB Viewer](http://gm3.jp)となります。  


## RF-ECG IoT Bridgeについて

「RF-ECG」と「IoT Bridge」は出荷時に独自プロトコルでペアリングされております。受信率は環境により異なりますが、近距離(1m以内)の場合、98％程度とお考え下さい。  
詳しい仕様については[RF-ECG IoT Bridge製品仕様](http://gm3.jp/xxxx#siyou)をご覧ください。


## 前提条件
node.js 6 以上、npm 3以上
node.jsは[https://nodejs.org](https://nodejs.org)よりダウンロードすることができます。  

## 使用法

### 1.1. 実行(ポート番号8080)

```bash
npm install
npm start
```
### 1.2. ポート番号指定実行(ポート番号:8081)

```bash
npm install
npm start -- --port=8081
```
### 2. RF-ECG IoT Bridgeの起動

RF-ECGとIoT Bridgeを起動してください。

### 3. 実行ファイルの作成
```bash
npm install
npm run packager
```

## 動作しない場合

**中継器の設定を再設定**

中継器の設定が間違っている可能性があります。再度設定を行ってください。  
参考:[IoT Bridge設定方法](http://gm3.jp/xxxx#siyou)

**ファイアーウォールの無効化**

PCのファイアーウォールによりECGデータがはじかれる場合があります。その場合、使用しているポートを例外(はじかない)設定をしてください。  
また、一時的にPCのファイアーウォールを無効、アンチウィルスソフトを無効にするなどをしてください。

## License
This software is released under the MIT License.
