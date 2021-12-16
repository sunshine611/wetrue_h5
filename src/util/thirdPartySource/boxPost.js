import { thirdPartyComm } from "@/util/thirdPartySource/comm";

/**
 * Box aepp 发布模块
 * topic 发布主贴
 * comment 发布评论
 * reply 发布回复
 */

export const boxPost = function(payload) {
    let content;
    let type = payload.boxPostType;

    if (type === "topic") {
        content = {
            type: "topic"
        };
    } else if (type === "comment") {
        content = {
            type: "comment",
            toHash: payload.toHash,
        };
    } else if (type === "reply") {
        content = {
            type: "reply",
            reply_type: payload.replyType,
            to_hash: payload.toHash,
            to_address: payload.toAddress,
            reply_hash: payload.replyHash,
        };
    } else {
        content = {
            type: "tips",
            message: "打赏不能用，请访问完整版",
        };
    }

    thirdPartyComm( JSON.stringify(content) );
}