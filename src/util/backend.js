import Request from "luch-request";
import { baseUrl, nodeUrl, aeknow, aeMdw, aeExplorer } from "@/config/config.js";
import store from "@/store";

export default class Backend {

	static viewExplorerUrl = (hash) => {
		return this.explorerViewhUrl(hash);
	};

	static nodeApiLastHeight = () => {
		return `${nodeUrl}/v3/key-blocks/current/height`;
	};

	static nodeApiNames = (names) => {
		return `${nodeUrl}/v3/names/${names}`;
	};

	static aeMdwApiNamesOwner = (address) => {
	//所有者aens列表
		return `${aeMdw}/names/owned_by/${address}/?direction=forward`;
	};

	static aeMdwApiNamesAuctions = () => {
	//正在竞拍aens
		return `${aeMdw}/names/auctions/?direction=forward&limit=100`;
	};

	static aeMdwApiNameDetails = (name) => {
	//aens详情
		return `${aeMdw}/name/${name}?expand`;
	};

	static nodeApiAccounts = (address) => {
		return `${nodeUrl}/v3/accounts/${address}`;
	};

	static aeknowViewhUrl = (hash) => {
		return `${aeknow}/miner/viewaccount/${hash}`;
	};
	
	static explorerViewhUrl = (hash) => {
		return `${aeExplorer}/transaction/${hash}/419`;
	};

	static aeknowApiTokenList = (address) => {
		return `${aeknow}/api/token/${address}`;
	};

	static aeMdwApiTokenList = (address) => {
		return `${aeMdw}/aex9/balances/account/${address}`;
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

	static aeknowApiMyToken = (
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

	static aeMdwApiMyToken = (
		address,
		contract,
		) => {
		let query = `${aeMdw}/aex9/balance`;
			query += `/${contract}`;
			query += `/${address}`;
		return query;
	};

	static setConfigInfo = async (address) => {
		const http = new Request({
			baseURL: baseUrl,
		});
		http.interceptors.request.use((config) => {
			config.header = {
				"Content-type": "application/x-www-form-urlencoded",
				"key": address,
        		"chain-id": 457,
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