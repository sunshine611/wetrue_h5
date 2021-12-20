<template>
    <div class="editor">
        <u-navbar
            back-text=""
            :title="i18n.index.sendContent"
            :border-bottom="false"
        >
            <div slot="right" class="right-btn">
                <u-button
                    type="primary"
                    size="mini"
                    :disabled="form.text.length === 0"
                    @click="release"
                    :loading="btnLoading"
                    >{{ i18n.index.send }}</u-button
                >
            </div>
        </u-navbar>
        <div class="font-24" style="color:#f04a82">
            {{ i18n.index.sendHint }}
        </div>
        <u-gap height="40"></u-gap>
        <u-input
            v-model="form.text"
            type="textarea"
            :border="false"
            height="300"
            :auto-height="true"
            :maxlength="50000"
            :placeholder="i18n.index.wetrueTips"
            :clearable="false"
        />
        <u-gap height="40"></u-gap>
		<!-- <u-upload ref="wetrueImg" :auto-upload="false" :file-list="fileList" :max-count="9" del-bg-color="#f04a82" @on-choose-complete="uploadImg"></u-upload> -->
    </div>
</template>

<script>
export default {
    data() {
        return {
            form: {
                text: "",
            },
            btnLoading: false, //按钮加载状态
			fileList:[],//文件列表
        };
    },
    onLoad(option) {
        this.isPassword();
        if (!!option.topic) {
            this.form= {
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
            let payload = {
                content: this.form.text,
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
            console.log(this.fileList)
			// console.log(this.$refs.wetrueImg)
			console.log(file[0].file)
			const ipfs = await this.$ipfs;
			let text = file[0].file;
			try{
				const added = await ipfs.add(text,{
					progress: (prog) => console.log(`received: ${prog}`),
				});
				console.log(added)
				const hashCode = added.cid.toString();
				console.log('https://ipfs.io/ipfs/'+hashCode)
			}catch(err){
				console.log(err)
			}
		},
        async saveToIpfs(event) {
            // 获取input上传的文件
            let file = 'Wetrue';
            const ipfs = await this.$ipfs;
            try {
                const added = await ipfs.add(file, {
                    progress: (prog) => console.log(`received: ${prog}`),
                });

                // 获取上传文件hash值，'https://ipfs.io/ipfs/'+hashCode 即为上传后的文件地址
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
