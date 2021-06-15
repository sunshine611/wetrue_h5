<template>
	<div class="editor">
		<u-navbar back-text="" title="发布主贴" :border-bottom="false">
			<div slot="right" class="right-btn">
				<u-button type="primary" size="mini" :disabled="form.text.length===0" @click="release"  :loading="btnLoading">{{i18n.index.send}}</u-button>
			</div>
		</u-navbar>
		<u-input v-model="form.text" type="textarea" :border="false" height="300" :auto-height="true" :maxlength="5000"
			:placeholder="i18n.index.wetrueTips" :clearable="false" />
		<u-gap height="20"></u-gap>
		<div class="font-28">该内容将录入到AE区块链中永久保存，上链将会花费矿工费用，请不要上传色情政治等敏感信息，共建健康AE生态。</div>
	</div>
</template>

<script>
	export default {
		data() {
			return {
				form: {
					text: ''
				},
				btnLoading: false, //按钮加载状态
			}
		},
		onLoad() {
			this.isPassword();
		},
		activated(){
			this.isPassword();
		},
		computed: {
			//国际化
			i18n() {
				return this.$_i18n.messages[this.$_i18n.locale]
			},
		},
		methods: {
			//发布
			async release() {
				this.btnLoading = true;
				uni.showLoading({
					title: this.i18n.index.inChain
				});
				let payload = {
					content: this.form.text
				}
				let res = await this.sendTopic(payload);
				if (!!res.hash) {
					uni.hideLoading();
					this.btnLoading = false;
					this.getConfigInfo();
					this.reLaunchUrl('index');
				}
			}
		}
	}
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
