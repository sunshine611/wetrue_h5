<template>
    <view class="editor">
        <u-status-bar></u-status-bar>
        <u-navbar 
            :title="i18n.index.sendContent" 
            :placeholder="true"
            :autoBack="true"
        >
            <view slot="right" class="right-btn">
                <u-button
                    type="primary"
                    size="mini"
                    :disabled="form.text.length === 0"
                    @click="release"
                    :loading="btnLoading"
                    >{{ i18n.index.send }}
                </u-button>
            </view>
        </u-navbar>
        <div class="font-24" style="color:#f04a82">
            {{ i18n.index.sendHint }}
        </div>
        <u-gap height="40"></u-gap>
        <u--textarea
            v-model="form.text"
            height="300"
            :maxlength="50000"
            :placeholder="i18n.index.wetrueTips"
            count
        ></u--textarea>
        <text>-------</text>
        <u-gap height="40"></u-gap>
        <!-- 
        <u-input
            v-model="form.media"
            type="textarea"
            :border="false"
            height="50"
            :auto-height="true"
            :maxlength="100"
            placeholder="输入IPFS CID"
            :clearable="false"
        />
        
        <u-gap height="40"></u-gap>
		<u-upload ref="wetrueImg" :auto-upload="false" :file-list="fileList" :max-count="9" del-bg-color="#f04a82" @on-choose-complete="uploadImg"></u-upload> -->
    </view>
</template>

<script>

export default {
    data() {
        return {
            form: {
                text: "",
                media: "",
            },
            btnLoading: false, //按钮加载状态
			fileList:[],//文件列表
        };
    },
    onLoad(option) {
        this.uSetBarTitle(this.i18n.titleBar.sendContent);
        this.isPassword();
        if (!!option.topic) {
            this.form = {
                text: option.topic + " ",
            };
        }
    },
    mounted() {
        //暴露方法名"receiveWeTrueMessage"
        window["receiveWeTrueMessage"] = async (res) => {
            if (res.code == 200) {
                this.postHashToWeTrue(res);
            } else {
                res = null;
            }
            this.releaseCallback(res);
        };
    },
    activated() {
        this.isPassword();
    },
    computed: {
        //国际化
        i18n: {
            get() {
                return this.$_i18n.messages[this.$_i18n.locale];
            },
        },
    },
    methods: {
        //发布
        async release() {
            this.btnLoading = true;
            let media = [
                {
                    image: this.form.media,
                },
            ];
            let payload = {
                content: this.form.text,
                media:   media,
            };
            let res = await this.wetrueSend("topic", payload);
            this.releaseCallback(res);
        },
        releaseCallback(callback) {
            if (JSON.stringify(callback) !== "{}" && !!callback) {
                uni.hideLoading();
                this.btnLoading = false;
                this.getConfigInfo();
                this.reLaunchUrl("index");
            } else {
                uni.hideLoading();
                this.btnLoading = false;
            }
        },
		//上传图片
		async uploadImg(file){
			const ipfs = await this.$ipfs;
            const added = await ipfs.add('WeTrue');
            console.log(added.cid.toString());
            this.form.media = added.cid.toString();
		},
        async saveToIpfs(event) {
            // 获取input上传的文件
            let file = 'WeTrue';
            const ipfs = await this.$ipfs;
            try {
                const added = await ipfs.add(file, {
                    progress: (prog) => console.log(`received: ${prog}`),
                });

                // 获取上传文件hash值，'https://liushao.cc:15680/ipfs/'+hashCode 即为上传后的文件地址
                const hashCode = added.cid.toString();
				console.log(hashCode)

                // 此处可以对获得的hash值进行其他操作
            } catch (err) {
                // console.error(err);
            }
        },
    },
};
</script>

<style scoped lang="scss">
page {
    background-color: #fff;
}
.editor {
    padding: 30rpx;

    .right-btn {
        padding-right: 30rpx;
    }
}
</style>
