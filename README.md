# remark-shiki

shiki with semantic highlighting support

## Usage

see `index.test.js`

```wtf
testetstst
```

``` cpp
#include <cstdio>
const int N = 100005;
int rt, tot, fa[N], ch[N][2], val[N], cnt[N], sz[N];
struct Splay {
  void maintain(int x) { sz[x] = sz[ch[x][0]] + sz[ch[x][1]] + cnt[x]; }
  bool get(int x) { return x == ch[fa[x]][1]; }
  void clear(int x) {
    ch[x][0] = ch[x][1] = fa[x] = val[x] = sz[x] = cnt[x] = 0;
  }
  void rotate(int x) {
    int y = fa[x], z = fa[y], chk = get(x);
    ch[y][chk] = ch[x][chk ^ 1];
    fa[ch[x][chk ^ 1]] = y;
    ch[x][chk ^ 1] = y;
    fa[y] = x;
    fa[x] = z;
    if (z) ch[z][y == ch[z][1]] = x;
    maintain(x);
    maintain(y);
  }
  void splay(int x) {
    for (int f = fa[x]; f = fa[x], f; rotate(x))
      if (fa[f]) rotate(get(x) == get(f) ? f : x);
    rt = x;
  }
  void ins(int k) {
    if (!rt) {
      val[++tot] = k;
      cnt[tot]++;
      rt = tot;
      maintain(rt);
      return;
    }
    int cnr = rt, f = 0;
    while (1) {
      if (val[cnr] == k) {
        cnt[cnr]++;
        maintain(cnr);
        maintain(f);
        splay(cnr);
        break;
      }
      f = cnr;
      cnr = ch[cnr][val[cnr] < k];
      if (!cnr) {
        val[++tot] = k;
        cnt[tot]++;
        fa[tot] = f;
        ch[f][val[f] < k] = tot;
        maintain(tot);
        maintain(f);
        splay(tot);
        break;
      }
    }
  }
  int rk(int k) {
    int res = 0, cnr = rt;
    while (1) {
      if (k < val[cnr]) {
        cnr = ch[cnr][0];
      } else {
        res += sz[ch[cnr][0]];
        if (k == val[cnr]) {
          splay(cnr);
          return res + 1;
        }
        res += cnt[cnr];
        cnr = ch[cnr][1];
      }
    }
  }
  int kth(int k) {
    int cnr = rt;
    while (1) {
      if (ch[cnr][0] && k <= sz[ch[cnr][0]]) {
        cnr = ch[cnr][0];
      } else {
        k -= cnt[cnr] + sz[ch[cnr][0]];
        if (k <= 0) {
          splay(cnr);
          return val[cnr];
        }
        cnr = ch[cnr][1];
      }
    }
  }
  int pre() {
    int cnr = ch[rt][0];
    while (ch[cnr][1]) cnr = ch[cnr][1];
    splay(cnr);
    return cnr;
  }
  int nxt() {
    int cnr = ch[rt][1];
    while (ch[cnr][0]) cnr = ch[cnr][0];
    splay(cnr);
    return cnr;
  }
  void del(int k) {
    rk(k);
    if (cnt[rt] > 1) {
      cnt[rt]--;
      maintain(rt);
      return;
    }
    if (!ch[rt][0] && !ch[rt][1]) {
      clear(rt);
      rt = 0;
      return;
    }
    if (!ch[rt][0]) {
      int cnr = rt;
      rt = ch[rt][1];
      fa[rt] = 0;
      clear(cnr);
      return;
    }
    if (!ch[rt][1]) {
      int cnr = rt;
      rt = ch[rt][0];
      fa[rt] = 0;
      clear(cnr);
      return;
    }
    int cnr = rt;
    int x = pre();
    splay(x);
    fa[ch[cnr][1]] = x;
    ch[x][1] = ch[cnr][1];
    clear(cnr);
    maintain(rt);
  }
} tree;

int main() {
  int n, opt, x;
  for (scanf("%d", &n); n; --n) {
    scanf("%d%d", &opt, &x);
    if (opt == 1)
      tree.ins(x);
    else if (opt == 2)
      tree.del(x);
    else if (opt == 3)
      printf("%d\n", tree.rk(x));
    else if (opt == 4)
      printf("%d\n", tree.kth(x));
    else if (opt == 5)
      tree.ins(x), printf("%d\n", val[tree.pre()]), tree.del(x);
    else
      tree.ins(x), printf("%d\n", val[tree.nxt()]), tree.del(x);
  }
  return 0;
}
```

```js
const languages = [
  ...commonLangIds,
  ...commonLangAliases,
  ...otherLangIds
]
```

```pseudo
% This quicksort algorithm is extracted from Chapter 7, Introduction 
      % to Algorithms (3rd edition) 
      \begin{algorithm}
      \caption{Quicksort}
      \begin{algorithmic}
      \PROCEDURE{Quicksort}{$A, p, r$}
          \IF{$p < r$} 
              \STATE $q = $ \CALL{Partition}{$A, p, r$}
              \STATE \CALL{Quicksort}{$A, p, q - 1$}
              \STATE \CALL{Quicksort}{$A, q + 1, r$}
          \ENDIF
      \ENDPROCEDURE
      \PROCEDURE{Partition}{$A, p, r$}
          \STATE $x = A[r]$
          \STATE $i = p - 1$
          \FOR{$j = p$ \TO $r - 1$}
              \IF{$A[j] < x$}
                  \STATE $i = i + 1$
                  \STATE exchange
                  $A[i]$ with $A[j]$
              \ENDIF
              \STATE exchange $A[i]$ with $A[r]$
              \STATE $x=\frac{-b\pm \sqrt{b^2-4ac}}{2a}$
          \ENDFOR
      \ENDPROCEDURE
      \end{algorithmic}
      \end{algorithm}
```

```latex
接下来的 $m$ 行中的第 $i$ 行包含两个正整数 $l_i$ 和 $r_i$ ($1\le l_i\le r_i\le n$)，表示第 $i$ 次操作在区间 $[l_i,r_i]$ 上进行。
```
