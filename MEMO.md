## Git setting up commands
``` bash
git init
git remote add origin git@github.com:omasakun/inf_reversi.git
git remote set-url origin --add git@gitlab.com:omasakun/inf_reversi.git

# .gitattributes で設定したファイルをmerge対象から外す
git config merge.ours.driver true 

# git nffm ...
git config alias.nffm "merge --no-ff"
git config alias.sqm "merge --squash"
```

## TODO
- [ ] スクリーンショットを撮ってReadmeに貼る
- [ ] Readme の説明をちゃんと書く
- [ ] Github Pages を有効化する

## NOTES
