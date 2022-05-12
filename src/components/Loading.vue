<template>
	<view>
		<svg height="100%" width="100%" viewBox="-20.654044750430295 -21.996557659208264 1241.3080895008607 1243.9931153184166" x="0" y="0" id="document" class="disable-on-play" fill="transparent">
		    <g id="elements" style="isolation: isolate;">
		        <defs id="dynamic-definitions">
		            <linearGradient id="ellipse-q79an5euegn--stroke" x1="0" y1="0.5" x2="1" y2="0.5" spreadMethod="pad" gradientUnits="objectBoundingBox">
		                <stop id="ellipse-q79an5euegn--stroke-stop-0" offset="0" stop-color="rgb(0,163,255)"></stop>
		                <stop id="ellipse-q79an5euegn--stroke-stop-1" offset="1" stop-color="rgb(0,52,232)"></stop>
		            </linearGradient>
		            <linearGradient id="ellipse-51gfnuexh6c--fill" x1="0" y1="0.5" x2="1" y2="0.5" spreadMethod="pad" gradientUnits="objectBoundingBox">
		                <stop id="ellipse-51gfnuexh6c--fill-stop-0" offset="0" stop-color="rgb(0,163,255)"></stop>
		                <stop id="ellipse-51gfnuexh6c--fill-stop-1" offset="1" stop-color="rgb(0,52,232)"></stop>
		            </linearGradient>
		            <linearGradient id="ellipse-th8rfzjaes--fill" x1="0" y1="0.5" x2="1" y2="0.5" spreadMethod="pad" gradientUnits="objectBoundingBox">
		                <stop id="ellipse-th8rfzjaes--fill-stop-0" offset="0" stop-color="rgb(0,163,255)"></stop>
		                <stop id="ellipse-th8rfzjaes--fill-stop-1" offset="1" stop-color="rgb(0,52,232)"></stop>
		            </linearGradient>
		        </defs>
		        <defs id="definitions"></defs>
		        <g id="elements-wrapper" width="1200" height="1200">
		            <ellipse ref="outter" id="ellipse-q79an5euegn" rx="500" ry="500" transform="matrix(0 -1 1 0 600 600)" 
					fill="none" stroke="url(#ellipse-q79an5euegn--stroke)" stroke-width="100" 
					stroke-linecap="round" :stroke-dasharray="d1 + ' ' + d2" 
					style="mix-blend-mode: normal; paint-order: fill;" 
					:stroke-dashoffset="strokeDashoffset"></ellipse>
		            <ellipse ref="inner" id="ellipse-51gfnuexh6c" rx="928.571429" ry="928.571429" 
					:transform="'matrix(' + sH + ' 0 0 ' + sW + ' 600 600)'" fill="url(#ellipse-51gfnuexh6c--fill)" 
					stroke="none" stroke-width="15" style="mix-blend-mode: normal; paint-order: fill;"></ellipse>
		        </g>
		    </g>
		    <path d="M-20.654044750430295 -21.996557659208264 h1241.3080895008607 v1243.9931153184166 h-1241.3080895008607 z M0 0 h1200 v1200 h-1200 z" fill-rule="evenodd" id="overlay"></path>    <!---->    <!---->
		    <g id="tool-selection">
		        <g></g>
		        <g>            <!---->            <!----></g>        <!----></g>
		</svg>
	</view>
</template>

<script>
	export default {
		name:"Loading",
		data() {
			return {
				d1:0,
				d2:3600,
				strokeDashoffset:0,
				sH:0,
				sW:0,
				timer:null,
			};
		},
		computed:{
			
		},
		mounted() {
			this.addInterval()
		},
		onShow() {
			
		},
		destroyed() {
			clearInterval(this.timer)
			this.timer = null
		},
		methods:{
			addInterval(){
				const that = this
				var t = 0; // 时间
				var et = 2000; //持续时间
				var keyframes = [0,1000,2000]
				var scaleFrames = [0,0.35,0]
				var stockeOffestFrames = [0,0,-3600]
				var stockDashes1Frames = [0,3600,3600]
				var stockDashes2Frames = [3600,3600,3600]
				var targetScale = 0;
				var targetstockeOffest = 0;
				var targetstockDashes1 = 0;
				var targetstockDashes2 = 3600;
				this.timer = setInterval(() =>{
				for (var i = 0; i < keyframes.length; i++) {
					if(t === keyframes[i]){
						targetScale = scaleFrames[i + 1]
						targetstockeOffest = stockeOffestFrames[i + 1]
						targetstockDashes1 = stockDashes1Frames[i + 1]
						targetstockDashes2 = stockDashes2Frames[i + 1]
						break
					}
				}
				that.d1  = that.d1  + (targetstockDashes1 - that.d1 ) / 10
				that.d2 = that.d2 + (targetstockDashes2 - that.d2) / 10
				that.strokeDashoffset = that.strokeDashoffset + (targetstockeOffest - that.strokeDashoffset) / 10
				that.sH = that.sH + (targetScale - that.sH) / 10
				that.sW = that.sW + (targetScale - that.sW) / 10
				t += 10
				if(t >= et){
					t = 0;
					that.d1 = 0
					that.d2 = 3600
					that.strokeDashoffset = 0
					that.sH = 0
					that.sW = 0
					
				}
			},10)
			}
		}
	}
</script>

<style>
	.outter{
		stroke-width: 15;
		transform-origin: center;
		transform: rotateZ(-90deg);
		stroke: linear-gradient(to right,#00a3ff,#0034e8) 1 10;
	}
	.inner{
		transform-origin: center;
		background-color:  linear-gradient(to right,#00a3ff,#0034e8) 1 10;
	}
</style>