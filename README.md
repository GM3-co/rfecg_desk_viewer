RF-ECG Desk Viewer
====

RF-ECG Desk Viewerは[RF-ECG2-BR(β版)](http://gm3.jp/rf-ecg-wifi.html)のデータを表示するデスクトップ版サンプルプログラムです。  


## To Use

[Git](https://git-scm.com)、[Node.js](https://nodejs.org/en/download/)がインストールされたPCが必要です。  
コマンドラインから以下の入力します。

```bash
npm install
npm start
```

TCPデータ受信ポートを変更する場合は下記の通りに指定することができます。

```bash
npm install
npm start -- --port=8081
```
## ECGデータを受信する表示する

[RF-ECG2-BR(β版)](http://gm3.jp/rf-ecg-wifi.html)のECG Desk Viewerを使った使用手順を参考にしてください。

### 3. 実行ファイルの作成
```bash
npm install
npm run packager
```

## License
This software is released under the MIT License.

**※本システムはelectron-[Quick Start Guide](http://electron.atom.io/docs/latest/tutorial/quick-start)をベースに作成しています。**