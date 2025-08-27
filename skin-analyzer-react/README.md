# skin_analyzer

Analyze skin condition. It works with frontend mainly client process. Language: javascript

## Development

Open `public/index.html` in a browser to see the blank page.
You can also run a local server:

```bash
npm start
```

This will serve the `public` directory.


# 概要
ブラウザから写真撮影を行なって、肌の状態を判定して出力する

## 判定項目

### 毛穴の大きさ

隣接ピクセルからの輝度の変化量より毛穴を検出し、そのサイズのトータルが顔全体の何％になっているかを出力

### 赤み

顔全体のピクセルから赤チャンネルの平均値を出力

### 赤みの色むら

赤チャンネルのX,Y方向での変異をとり、フーリエ変換して出力する

## その他要件

フロントエンドのみで作動し、基本的に処理はclient側で完結するようにする