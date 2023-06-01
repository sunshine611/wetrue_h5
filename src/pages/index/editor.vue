<template>
    <view class="editor">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" back-text="" :title="$t('index.sendContent')" :border-bottom="false">
            <div slot="right" class="right-btn">
                <u-button
                    type="primary"
                    size="mini"
                    :disabled="form.text.length === 0"
                    @click="release"
                    :loading="btnLoading"
                    >{{ $t('index.send') }}</u-button
                >
            </div>
        </u-navbar>
        <div class="font-24" style="color:#f04a82">
            {{ $t('index.sendHint') }}
        </div>
        <u-gap height="40"></u-gap>
        <u-input
            v-model="form.text"
            type="textarea"
            :border="false"
            height="300"
            :auto-height="true"
            :maxlength="50000"
            :placeholder="this.postShTip ? $t('index.postShTips') : $t('index.wetrueTips')"
            :clearable="false"
        />
        <text>-------</text>
        <u-gap height="40"></u-gap>
        
        <u-input
            v-model="form.media.ipfs"
            type="text"
            :border="true"
            :disabled="postIpfs"
            :maxlength="64"
            :placeholder="inputPlaceholder"
            :clearable="false"
            @input="checkIpfs($event)"
            class="input"
        />
        <!-- 
        <u-gap height="40"></u-gap>
		<u-upload ref="wetrueImg" :auto-upload="false" :file-list="fileList" :max-count="9" del-bg-color="#f04a82" @on-choose-complete="uploadImg"></u-upload>
        -->
    </view>
</template>

<script>
import { getStore } from "@/util/service";

export default {
    data() {
        return {
            form: {
                text: "",
                media: {
                    ipfs: ""
                },
            },
            btnLoading: false, //按钮加载状态
			fileList:[], //文件列表
            postShTip: false, //发布到SH
            postIpfs: true, //发布到ipfs
            userInfo: getStore("userInfo"),
            inputPlaceholder: "仅限VIP使用",
        };
        
    },
    onLoad(option) {
        this.uSetBarTitle(this.$t('titleBar.sendContent'));
        this.isPassword();
        if (!!option.topic) {
            this.form = {
                text: option.topic + " ",
            };
        } else if (!!option.shtip) {
            this.postShTip = true
        }
        if (this.userInfo.isVip) {
            this.postIpfs = false
            this.inputPlaceholder = '输入 Qm开头 IPFS CID0'
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
    },
    methods: {
        //发布
        async release() {
            this.btnLoading = true;
            let ipfsUrl = this.form.media.ipfs
            ipfsUrl = ipfsUrl.replace("ipfs://","")
            let media = [
                {
                    image: {
                        ipfs: `ipfs://${ipfsUrl}`
                    }
                },
            ];
            let payload = {
                content: this.form.text,
                media:   media,
            };
            let res;
            if (this.postShTip) {
                //发布到 Superhero
                res = await this.contractShTip(
                    payload.content + '[Source WeTrue.io]'
                );
            } else {
                //发布到 WeTrue
                res = await this.wetrueSend("topic", payload);
            }
            this.releaseCallback(res);
        },
        releaseCallback(callback) {
            if (callback !== {} && !!callback) {
                this.uHideLoading();
                this.btnLoading = false;
                this.getConfigInfo();
                this.reLaunchUrl("index");
            } else {
                this.uHideLoading();
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
        checkIpfs (event) {
            this.$nextTick(() => {
                this.checkIpfsUrl(event)
            })
        },
        checkIpfsUrl(e) {
            let val = e.replace(/(^\s*)|(\s*$)/g, "")
            if (!val) {
                return ''
            }
            let expt = /Qm([a-zA-Z0-9]+)/g;
            val.replace(expt, (item) => {
                this.form.media.ipfs = item
            });
        }
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
.input {
		padding-left: 30rpx;
		color: #000;
		height: 100%;
		flex: 1;
	}
</style>
