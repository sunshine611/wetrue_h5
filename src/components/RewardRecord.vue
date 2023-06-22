<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
    record: {
        type: Array,
        default: () => [],
    }
})
const emits = defineEmits(['modelValue'])

const showModal = ref(props.modelValue)

watch(
	() => props.modelValue,
	(val) => {
        showModal.value = val;
	}
)

watch(
	() => showModal.value,
	(val) => {
        emits("modelValue", val);
	}
)
</script>

<template>
    <view class="reward">
        <u-popup
            v-model="showModal"
            mode="center"
            width="80%"
            height="70%"
            :border-radius="10"
        >
            <view class="reward-content">
                <view class="title mb-40">
                    <u-image
                        width="92rpx"
                        height="46rpx"
                        src="@/static/logo.png"
                        class="inline mr-5"
                    ></u-image>
                    {{ $t('components.recordList') }}
                </view>
                <u-table>
                    <u-tr>
                        <u-th>{{ $t('components.recordMan') }}</u-th>
                        <u-th>{{ $t('components.balance') }}</u-th>
                    </u-tr>
                    <u-tr v-for="(item,index) in record" :key="index">
                        <u-td>{{item.nickname}}[{{item.sender_id.slice(-4)}}]</u-td>
                        <u-td>{{balanceFormat(item.amount, 1)}}</u-td>
                    </u-tr>
                </u-table>
            </view>
        </u-popup>
    </view>
</template>

<style lang="scss" scoped>
.reward {
    .reward-content {
        padding: 50rpx 40rpx;
        .title {
            font-size: 36rpx;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
}
</style>
