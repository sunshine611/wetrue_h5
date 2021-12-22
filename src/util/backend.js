import Request from "luch-request";
import { baseUrl, nodeUrl, aeknow } from "@/config/config.js";
import store from "@/store";

export default class Backend {
	static nodeApiNames = (names) => {
		return `${nodeUrl}/v3/names/${names}`;
	};

	static nodeApiAccounts = (address) => {
		return `${nodeUrl}/v3/accounts/${address}`;
	};

	static aeknowSearchUrl = (content) => {
		return `${aeknow}/miner/viewaccount/${content}`;
	};

	static aeknowApiTokenList = (token) => {
		return `${aeknow}/api/token/${token}`;
	};

	static nodeApiGetAddressByNames = async (names) => {
		const http = new Request();
		return new Promise((resolve) => {
			http.get(
				`${nodeUrl}/v3/names/${names}`
			).then((res) => {
				if (res.data.id) {
					if (res.data.pointers.length > 0) {
						resolve(res.data.pointers[0].id);
					} else {
						resolve(res.data.owner);
					}
				}
			});
		});
	};

	static aeknowApiMyToken= (
		address,
		contract,
		) => {
		let query = `${aeknow}/api/mytoken`;
			query += `/${address}`;
			query += `/${contract}`;
		return query;
	};

	static aeknowApiSpendTx = (
			address,
			limit,
			offset,
		) => {
		let query = `${aeknow}/api/spendtx`;
			query += `/${address}`;
			query += `/${limit}`;
			query += `/${offset}`;
		return query;
	};

	static aeknowApiTokenTxs = (
			address,
			contract,
			limit,
			offset,
		) => {
		let query = `${aeknow}/api/tokentxs`;
			query += `/${address}`;
			query += `/${contract}`;
			query += `/${limit}`;
			query += `/${offset}`;
		return query;
	};

	static setConfigInfo = async (address) => {
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
		http.post("/Config/info").then((res) => {
			if (res.code === 200) {
				store.commit("user/SET_CONFIGINFO", res.data);
			}
		});
	};
}