<script setup>
import { ref, getCurrentInstance } from 'vue'
import { onLoad } from '@dcloudio/uni-app';
import { mixinUtils } from'@/mixins/mixinUtils'
import { useUserStore } from "@/stores/userStore";
const userStore = useUserStore();
const { proxy } = getCurrentInstance();

const btnLoading = ref(false) //按钮加载状态
const postShTip = ref(false) //发布到SH
const postIpfs = ref(true) //发布到ipfs
const fileList = ref([]) //文件列表
const media = ref([])
const inputPlaceholder = ref('仅限VIP使用') //文件列表
const form = ref({ //页码信息
    text: "",
    media: {},
})

onLoad ( (option) => {
    proxy.uSetBarTitle(proxy.$t('titleBar.sendContent'));
    proxy.isPassword();
    upUserInfo();
    if (!!option.topic) {
        form.value = {
            text: option.topic + " ",
        };
    } else if (!!option.shtip) {
        postShTip.value = true
    }
});

//暴露方法名"receiveWeTrueMessage"
window["receiveWeTrueMessage"] = async (res) => {
    if (res.code == 200) {
        proxy.postHashToWeTrue(res);
    } else {
        res = null;
    }
    releaseCallback(res);
};

//发布
const release = async () => {
    btnLoading.value = true;
    let payload = {
        content: form.value.text,
        media:   media.value,
    };
    let res;
    if (postShTip.value) {
        //发布到 Superhero
        res = await proxy.contractShTip(
            payload.content + '[Source WeTrue.io]'
        );
    } else {
        //发布到 WeTrue
        res = await proxy.wetrueSend("topic", payload);
    }
    releaseCallback(res);
}
const releaseCallback = (callback) => {
    if (callback !== {} && !!callback) {
        proxy.uHideLoading();
        btnLoading.value = false;
        mixinUtils.getConfigInfo();
        proxy.reLaunchUrl("index");
    } else {
        proxy.uHideLoading();
        btnLoading.value = false;
    }
}
/* 暂未启用
//上传图片
const uploadImg = async (file) => {
    const ipfs = await this.$ipfs;
    const added = await ipfs.add('WeTrue');
    console.log(added.cid.toString());
    form.value.media = added.cid.toString();
}
const saveToIpfs = async (event) => {
    // 获取input上传的文件
    let file = 'WeTrue';
    const ipfs = await this.$ipfs;
    try {
        const added = await ipfs.add(file, {
            progress: (prog) => console.log(`received: ${prog}`),
        });

        // 获取上传文件hash值，'https://dweb.link/ipfs/'+hashCode 即为上传后的文件地址
        const hashCode = added.cid.toString();
        console.log(hashCode)

        // 此处可以对获得的hash值进行其他操作
    } catch (err) {
        // console.error(err);
    }
}
*/

//获取用户信息
const upUserInfo = () => {
        if (userStore.userInfo.isVip) {
        postIpfs.value = false
        inputPlaceholder.value = '输入 Qm开头 IPFS CID0'
    }
}

const checkIpfs = (event) => {
    proxy.$nextTick(() => {
        checkIpfsUrl(event)
    })
}
const checkIpfsUrl = (e) => {
    let val = e.replace(/(^\s*)|(\s*$)/g, "")
    if (!val) {
        return ''
    }
    let expt = /Qm([a-zA-Z0-9]+)/g;
    val.replace(expt, (item) => {
        media.value =  [{
            image: {
                ipfs: `ipfs://${item}`
            }
        }]
    });
}
</script>

<template>
    <view class="editor">
        <view :style="{height:`${statusBarHeight}px`, background:'#f04a82'}"></view>
        <u-navbar :is-fixed="false" back-text="" :title="$t('index.sendContent')" :border-bottom="false">
            <template v-slot:right>
                <view class="right-btn">
                    <u-button
                        type="primary"
                        size="mini"
                        :disabled="form.text.length === 0"
                        @click="release"
                        :loading="btnLoading"
                        >{{ $t('index.send') }}</u-button
                    >
                </view>
            </template>
        </u-navbar>
        <view class="font-24" style="color:#f04a82">
            {{ $t('index.sendHint') }}
        </view>
        <u-gap height="40"></u-gap>
        <u-input
            v-model="form.text"
            type="textarea"
            :border="false"
            height="300"
            :auto-height="true"
            :maxlength="50000"
            :placeholder="postShTip.value ? $t('index.postShTips') : $t('index.wetrueTips')"
            :clearable="false"
        />
        <text>-------</text>
        <u-gap height="40"></u-gap>
        
        <u-input
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
