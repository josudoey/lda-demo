import { pick } from 'lodash'
import Vue from 'vue/dist/vue.esm'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import VueWordCloud from 'vuewordcloud'

// Import Bootstrap an BootstrapVue CSS files (order is important)
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import LDA from './lda'
import color256 from './rand256-color'

// Make BootstrapVue available throughout your project
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)
Vue.component(VueWordCloud.name, VueWordCloud)

const app = {
  components: {
  },
  data () {
    let history = {}
    try {
      history = JSON.parse(window.localStorage.getItem('history'))
    } catch (err) {

    }
    return Object.assign(this.default(), {
      tabIndex: 'input',
      color256: color256,
      logText: '',
      theta: [],
      sentences: [],
      topics: []
    }, history)
  },
  mounted () {
  },
  methods: {
    default () {
      return {
        seed: 'random',
        topk: 4,
        terms: 20,
        iterations: 10000,
        burnIn: 2000,
        thinInterval: 100,
        sampleLag: 10,
        alpha: 0.1, // per-document distributions over topics
        beta: 0.01, // per-topic distributions over words
        stopwords: '',
        topicThreshold: 0.0001,
        text: `要 談到 苗族 的 一切 應 先 要 說 些 該 地 的 情形 風俗 習慣 廣西 的 苗族 是 產 在 恩隆縣 的 西北隅 離 恩隆 約 六十 里 苗族 的 住處 橫直 約 百餘里 一 片 荒山 大嶺 樹木 非常 繁盛 路 又 很 崎嶇 的 果若 我們 進 裏面 去 沒有 人 指導 不但 不會 走路 望見 那 叢森森 的 林木 都 會 發生 恐懼心 了 所以 外人 也 不 敢 去 侵犯 他 只要 他 有 兩 個 人 守 路口 任 你 如何 都 進 不 去 或是 他 一 羣 人 在 山 上 擲下 石子 來 那 不 知 要 死 多少 人 在 他 手 裏 啦 他們 在 明朝 還 上 地方官 恩隆 的 粮稅 到 了 淸朝 他們 便 不 上粮 了 反抗 滿 淸 是 很 激烈 這 不 知 他們 是 什麽 用意 他們 的 住處 很 不一定 在 一 個 大嶺 底下 有 得 十幾 家 零零星星 的 住起來 房屋 很 矮 多 是 棕葉 和 樹皮 造成 的 
        他們 是 沒有 什麽 宗教 的 只 是 每 個 人 隨便 到 山 上 敬 個 石頭 或是 大樹 來 祈求 自己 的 安全 隨便 各人 去 敬 什麽 很 自由 的 這 並 不 是 他們 的 教 比 喩 他們 敬 一 個 大 石 就 是 認 這 個 大 石 做 契父 一樣 這 是 廣西 各 處 都 差不多 有的 湖南 福建 也 有 不過 沒有 他們 苗族 這 麽興 行罷 
        他們 苗人 雖說 是 野蠻 風俗 非常 醇厚 人 也 忠實 和樂 同 類 不 相 殘害 ； 假使 外人 不 侵犯 他 他 也 非常 和靄謙讓 ； 對於 他們 的 土王 更 絕對 的 服從 土王 是 他們 族 中 最 有 勢力 的 人 都 是 公推出 的 ； 如 有 三 代 土王 辦事 不 好 就 實行 推倒 另 舉 土王 了 土王 就 是 這樣 產生 的 土王 有 王田 輪流 每 年 數 家 來 種 王田 這 是 土王 的 國錄 差不多 像 我們 古代 的 井田制 一樣 
        他們 的 衣服 很 樸素 是 用 棉 製造 有的 織有 很 好 的 圖案 花樣 男子 的 衣服 好像 我們 常見 的 和尙衣 但是 只 到 膝部 這樣 長 長年 不 穿 鞋襪 頭髮 留作 半圓形 蓬蓬 鬆鬆 不 梳 不 洗 非常 難看 女子 的 衣 袖 寬短 胸 袒露 沒有 衣領 在 乳部 下 緊繃 一 條 長 可 過 脚 只 離 地 五 寸 的 裙裹着 外衣 貧家 的 裙 是 素花布 富家 的 裙 下面 結有 很 好 的 花結 纏腰 的 帶子 約 有 丈 三四 長 四 寸 餘 寬 兩 端 由 胸 前 飄下 至 裙底 結有 很 美麗 的 花結 無論 貧富 這 條 帶子 是 很 注重 的 頭髮 作 髻形 在 頭頂 與 後腦 的 中間 富家 女子 髮 上面 綴 一 銀質花 像是 質量 很 重 的 貧家 就 沒有 了 手鐲 非常 大 完全 是 銀質 的 富家 女子 戴鐲 多 至 十餘 對 每 對 亦 很 重 的 表示 是 她 富家 的 意思 愈 多 愈 妙 貧家 至少 也 有 兩 對 耳環 亦 很 重 的 往往 見 她們 年老 的 耳朶 被 耳環 吊脫去 了 一半 呢 未 嫁 女子 更 有 一 個 銀 頸圈 表示 她 未 結婚 的 意思 富家 的 除 銀頸圈 外 還 有 一 對 銀脚圈 周身 銀質 的 粧飾 是 她們 所 特愛 的 有時 一 個 女子 要 佩帶 銀粧 飾品 重 約 十餘 斤 呢 這 是 她們 粧飾 特異 的 地方 男子 沒有 這樣 的 裝飾 男子 却 以 勇敢 為 美 每 個 男子 面 上 身 上 有 很多 的 傷痕 便有 很多 女子 願 嫁 他 女子 是 沒有 穿 褲子 的 下體 只 用 裙 來 遮蔽 着 每 個 女子 都 有 一 支 竹煙竿 並 一 個 銀煙盒 纏 在 裙腰 間 露出 一點 煙竿頭 常常 在 叢林 或是 草地 上 吸 起 煙 來 非常 起勁 我們 隨便 認識 她 與否 你 伸手 向 她 討 煙 吸 總 可以 的 她 不但 不 拒絕 並且 歡迎 若是 你 是 女子 與 她 同性 那 她 就 有點 不 肯 啊 
        當 在 夏天 的 時候 有些 女子 成羣結隊 的 或且 裸體 到 山溪 中 沐浴 或且 裸體 的 臥 在 草地 綠蔭 中 臥 在 草地 時 多 以 巾布 遮蔽 陰部 她們 對於 男子 完全 不 存 忌畏 的 只要 不 去 玩笑 她們 男子 也 可以 同 她們 裸着 身體 臥地 或 浴身 卽 至 撫着 她 的 皮膚 也 不 為 怪 雖 有 一 羣 女子 在 着 她 却 以為 榮耀 的 就 是 要 和 她 性交 只要 遠離 這 一 羣 女子 就 可以 的 或且 要 在 姊妹 面前 來 驕矜 啊 假如 是 有 子 的 婦人 雖 有 丈夫 也 是 這樣 
        在 他們 跳舞 的 時候 最 足 令 人 引起 興趣 跳舞 時 常常 在 草地 上 成 羣結隊 個個 穿 起 華美 的 衣服 有時 又 作 化裝 跳舞 非常 快樂 我們 看來 似乎 沒有 節調 而 他們 却 自有 一 種 規則 往往 在 風淸月朗 的 晚上 或是 天氣 晴和 的 日間 便有 出現 了 
        他們 的 言語 非常 特怪 與 尋常 廣西 土話 不同 也 不 見 他們 讀書 不 知 他們 有 書 讀 沒有 實査 不 淸楚 不過 我 住 了 二十幾 天 從未 看見 一 個 字 據 他們 自己 說 是 沒有 書 讀 也 不 知 什麽 叫做 字 罷 究竟 有否 我 還 不 敢 斷定 
        那 末 為什麽 他們 又 能 用 着 我們 的 舊曆 呢 每逢 舊曆 元旦日 他們 也 舉行 拜年禮 也 停止 工作 到 年初七 八 九 等 日 土王 就 出來 接 他 的 民衆 的 拜賀 在 很 空曠 的 地方 紮 一 個 棚子 蓋上 紅綠 的 花布 要 些 野花 野草 紮 在 上面 這 就 是 土王 的 行宮 到時候 了 附近 的 苗民 每 家 拿 着竹製 的 簸箕 裏面 盛着 許多 山禽 野獸 男男女女 通通 跪着 環繞成 一 個 大 圈 在 行宮 的 面前 中間 一 空 大地 便是 土王行 訓示 的 地方 訓示完 了 很多 美麗 的 少年 男女 都 到 中間 去 跳舞 土王 的 妻妾 因為 土王 可 娶 三 妻 子女 也 在 跳舞 的 場 中 非常 活潑 跳舞完 了 各 苗民 便 把 所 帶來 的 山野 的 食品 獻給 土王 土王 就 把 這些 食品 叫 人 去 弄好 圍着成 幾十 處 共食 非常 閙熱 並且 在 這 時候 土王 同 苗 民 共 飲食 共 賭酒 一 年 之中 只有 這 個 時候 苗民 與 土王 平等 沒有 尊卑 的 分別 了 苗民 得 食 了 這 個 共餐 要 算是 很 榮幸 的 一 回 事 食畢 就 把 餘賸 的 食品 分給 苗民 都 以為 非常 寶貴 的 
        要 談講 苗族 的 婚姻 須 先 談 他們 的 婦女 她們 平日 非常 自由 只有 名義 上 的 夫婦 沒有 倫理 上 的 束縛 女子 同 男子 是 一樣 的 有 權力 所 行 的 多 是 一夫 一妻制 嫁 夫 之後 不過 盡育 子女 與 同居 的 義務 娶妻 的 也 只 是 名義 的 丈夫 有 子女 就 是 自己 的 ； 妻卽 有 外遇 不過 所 生 的 子女 一定 歸 丈夫 所有 的 並且 出嫁 的 婦人 能 得 多數 人 歡喜 能 與 多數 人 發生 性 的 關係 她 的 丈夫 似乎 非常 喜歡 而 榮耀 以為 自己 的 妻 美好 纔 能 如此 ； 反之 一 個 女子 終 沒有 同 外人 發生 過 性 的 關係 或 雖 有 而 不 多 必 受 丈夫 輕視 或 捨棄 殆 以為 她 無 人 顧問 必 係 十分 醜惡 的 同時 每 個 男子 沒有 與 十 個 以上 的 女子 發生 性 的 關係 而 時常 來往 也 必 招 妻子 的 輕視 啊 所以 他們 在 結婚 後 居然 可 說 是 性交 自由 罷 他們 的 家庭 經濟 非常 簡單 所以 女子 也 不致 受 男子 的 壓迫 很 得 自由 的 度過 她 的 生活 
        他們 苗族 的 結婚法 有 兩 種 却 完全 立足 在 自由 配合 的 戀愛 觀點 上 我 也 不能 為 他 定出 個 名詞 來 只 照 所有 的 事實 一一 序述 罷了 
        第一 種 是 由 父母 主婚 的 無論 誰 家 凡 女子 長 到 了 十四 歲 之後 父母 都 不 留 她 在 家 裏 夜間 在 門 外 設 一 個 草床 給 他 睡眠 任憑 這 女子 與 異性 結合 在 此時 不 知 結交 了 多少 男子 遇有 她 心愛 的 他 便 談到 結婚 的 事 兩兩 攜手 去 問 她 的 父母 父母 也 無有 不許 的 祗 必須 經過 此 一 度 商量 就 是 商定 後 這 男子 便 取 相當 的 日期 不論 大小 送 一 個 禮 到 女家 名 曰 結紅  並且 送 一 個 大 猪頭 名 曰 紅花  女家 便 把 禮物 收 了 把 猪頭 來 煮熟 請 些 家族 來 共飲 並 介紹 這 男子 卽 新婿 給 家族 認識 食畢 後 便 把 猪頭 的 骨 從 正中線 上 用 刀 劈開 女子 的 父親 拿 一半 男子 拿 一半 作 將來 結婚 的 證據 假如 男子 把 這 骨 遺失 了 便 無論如何 不能 同 這 女子 結婚 了  結紅 已 畢 這 女子 仍舊 每 晚 在 門 外 住 那 男子 也 常 來 陪伴 她 在 相當 時期 或是 女子 受 了 孕 便 舉行 結婚 了 結婚 時 更 有 趣味 男子 把 禮物 ── 山禽 野獸 或是 獸皮 送到 女家 大飲大食 食罷 便 把 結紅 時 的 猪 頭骨 來 對合 對 得 不錯 了 便 把 這 女子 接去 一路 唱歌 至少 有 幾十 個 女子 陪送 可是 新娘 頭 上 帶 着 滿 頭 的 野花 傘 上 有 一 塊 大 紅 布 才 可以 分別 的 但是 又 有 一 種 打紅 的 事 在 新娘 到 男家 的 途中 常常 有成 羣結隊 的 人 來 刼擄 ； 如果 被 別人 刼擄去 了 便是 別 家 的 妻 了 無論如何 不能 取回 的 這 是 一 種 風俗 至少 要 新娘 進 了 男子 的 門檻 方 沒有 人 敢 刼擄 啊 所以 苗族 迎親 的 時候 必須 要 帶有 相當 的 打手 或 召集 多數 的 族人 預備 中途 打架子 的 往往 因 打紅 打死 多數 的 人口 也 是 常事 沒有 誰人任咎 的 不 是 很 可憐 吧 
        第二 種 則 由 土王 主婚 的 每 年 有 兩 個 時期 一 個 是 元宵夜 一 個 是 中秋夜 在 一 個 大 嶺 上 起 一 所 土王 的 座壇 兩 邊 分列 男女 當 這 個 晚上 未婚 的 男子 和 女子 都 到來 這 處 土王 坐 在 正中 男女 成 羣 比賽 唱歌 唱 得 約 三四 小時 土王 便 發令 跳舞 男女 便 齊集 混合 跳舞 有的 竟 在 跳舞場 中 發生 性 的 關係 不但 土王 不 管 別的 男女 也 不 管 的 跳畢 各 男女 便 把 身 纏 的 帶子 來 比較 長短 男 與 女 比 如果 某 男 與 某 女 的 裙帶 同 一 長 的 便 到 土王處 說明 說 是 天 訂 良緣 一樣 就 可以 准為 夫婦 攜手到 該 男子 的 家 中 去 了 只 教 次 日 同 到 女家 報告 而已 有的 女子 在 此 期 不能 得 着 配偶 便 至少 要 和 幾 個 男子 相交 取得 一些 男子 的 贈品 而 回 女 與 男 相交 後 男子 便 給予 女子 以 獸皮 或 食品 女子 給 男子 以 手帕 如 與 五 男子 交 便 得 五 件  以 博得 家庭 的 歡喜 說 是 雖 不 成婚 却 被 人 中意 了 也 不 算 丟臉 反之 假如 一 個 女子 空手而回 便 引為 恥辱 受 家庭 父母 兄嫂 的 輕視 同時 男子 在 該 晚上 不同 幾 個 女子 相交 帶 點 手帕 回來 也 會 被 父母 兄嫂 姐妹 的 譏刺 這些 贈品 都 是 預先 準備 的 
        以上 苗族 的 兩 種 婚娶法 巳經 說完 究竟 苗族 有 不 有 離婚 呢 這 是 沒有 的 比方 一 個 女子 嫁 後 如果 同 她 的 丈夫 有 感情 就 親密 點 就 常時 和 丈夫 同居 有時 與 別的 男子 發生 外遇 也 可 丈夫 還 以為 榮 如果 同 丈夫 感情 不 好 只 是 全 年 在 外面 居住 或 自己 起造 一 所 住屋 自有 別的 男子 來 愛 她 的 但是 無論如何 這 女子 所 生育 的 兒女 都 是 屬於 丈夫 的 只 有 這 點 關係 所以 她 雖 不 離婚 而 對於 住 的 生活 性 的 生活 是 非常 自由 啊 同時 女子 還 有 丈夫 存在 的 別的 男子 只 愛 她 而 沒有 誰人 敢 娶為 名義 上 的 夫婦 啊 至少 要 丈夫 或 妻子 死 了 方 可 因此 他們 也 沒有 一夫多妻制 土王 自是 例外  也 沒有 離婚 
        最後 要 說明 我 這 篇 文字 的 動機 因為 看見 本 誌 十三 卷 五 期 有 陳雅弦 女士 緬俗紀異 的 一 篇 大作 感觸 起來 的 這樣 的 風俗 叫做 紀異  也 無 不 可 吧 
        述 於 柳州 香竿街`
      }
    },
    log (msg) {
      this.logText += msg + '\n'
    },
    calc () {
      const self = this
      this.logText = ''
      setTimeout(function () {
        const stopwords = self.stopwords.split(/\s+/)
        const sentences = self.text.split('\n')
        const documents = []
        const freq = {}
        const words = []
        let docCount = 0
        for (let i = 0; i < sentences.length; i++) {
          if (sentences[i] === '') {
            continue
          }
          const docWords = sentences[i].split(/[\s,"]+/)
          if (!docWords.length) {
            continue
          }
          const wordIndices = []
          for (let index = 0; index < docWords.length; index++) {
            const word = docWords[index]
            if (
              word === '' ||
              word.length === 1 ||
              word.indexOf('http') === 0 ||
              stopwords.indexOf(word) >= 0
            ) {
              continue
            }

            if (!freq[word]) {
              freq[word] = 0
              words.push(word)
            }
            freq[word] = freq[word] + 1
            const wordIndex = words.indexOf(word)
            wordIndices.push(wordIndex)
          }

          if (!wordIndices.length) {
            continue
          }

          documents[docCount++] = wordIndices
        }

        const { theta, phi } = LDA(parseInt(self.topk), documents, words, {
          seed: self.seed,
          iterations: Number(self.iterations),
          burnIn: Number(self.burnIn),
          thinInterval: Number(self.thinInterval),
          sampleLag: Number(self.sampleLag),
          alpha: Number(self.alpha),
          beta: Number(self.beta)
        })

        let topTerms = self.terms
        const topics = []
        for (let k = 0; k < phi.length; k++) {
          const tuples = []
          for (let w = 0; w < phi[k].length; w++) {
            tuples.push({
              word: words[w],
              prob: phi[k][w]
            })
          }
          tuples.sort(function (a, b) {
            return b.prob - a.prob
          })
          if (topTerms > words.length) {
            topTerms = words.length
          }
          topics[k] = []
          for (let t = 0; t < topTerms; t++) {
            const topicTerm = tuples[t].word
            const prob = tuples[t].prob * 100
            if (prob < self.topicThreshold) {
              continue
            }
            self.log('topic ' + k + ': ' + topicTerm + ' = ' + prob + '%')
            topics[k].push(tuples[t])
          }
        }

        self.$set(self, 'sentences', sentences)
        self.$set(self, 'theta', theta)
        self.$set(self, 'topics', topics)
        self.$set(self, 'tabIndex', 'result')
        window.localStorage.setItem('history', JSON.stringify(
          pick(self.$data, [
            'seed',
            'topk',
            'terms',
            'iterations',
            'burnIn',
            'thinInterval',
            'sampleLag',
            'beta',
            'stopwords',
            'topicThreshold',
            'text'
          ])
        ))
      }, 0)
    }
  }
}

const vm = new Vue(app)
vm.$mount('#app')
