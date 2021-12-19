import Request from "luch-request";
import { baseUrl } from "@/config/config.js";
import store from "@/store";

export const setConfigInfo = function(address){
	let params = {
		userAddress: address,
		type: "login",
	};

	const http = new Request({
		baseURL: baseUrl,
	});

	http.interceptors.request.use((config) => {
		config.header = {
			"Content-type": "application/x-www-form-urlencoded",
			"ak-token": address,
		};
		return config;
	});

	http.interceptors.response.use((res) => {
		return res.data;
	});

	http.post("/Config/info", params).then((res) => {
		if (res.code === 200) {
			store.commit("user/SET_CONFIGINFO", res.data);
		}
	});
}