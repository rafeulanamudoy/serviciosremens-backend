// import { kkiapay } from "@kkiapay-org/nodejs-sdk";
import {kkiapay} from "@kkiapay-org/nodejs-sdk"
 
import config from "../config";


export const k = kkiapay({privatekey:config.kkiapay.private_key as string,
    publickey:config.kkiapay.public_key as string,
    secretkey:config.kkiapay.kkiapay_secret as string,
    sandbox:true})


