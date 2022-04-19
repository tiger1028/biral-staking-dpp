// node_modules
import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Flex, Button, Image, Stack } from "@chakra-ui/react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

// context
import WalletContext from "../../context/walletContext";

// config
import { providerOptions, Contracts } from "../../config";

// consts
import { PATH } from "../../consts";

// utils
import { getWeb3 } from "../../utils";

// assets
import Logo from "../../assets/satoshi-head.png";
import ButtonImage from "../../assets/button.png";

const HeaderComponent: React.FC = () => {
    const [provider, setProvider] = useState<any>(null);
    const [library, setLibrary] = useState<any>(null);
    const [account, setAccount] = useState<string>("");
    const [signature, setSignature] = useState("");
    const [error, setError] = useState<any>("");
    const [chainId, setChainId] = useState<any>(null);
    const [network, setNetwork] = useState<any>(null);
    const [message, setMessage] = useState("");
    const [signedMessage, setSignedMessage] = useState("");
    const [verified, setVerified] = useState();

    const walletContext = useContext(WalletContext);

    const web3Modal = new Web3Modal({
        cacheProvider: true, // optional
        providerOptions, // required
    });

    const connectWallet = async () => {
        try {
            const provider = await web3Modal.connect();
            await provider.enable();
            const library = new ethers.providers.Web3Provider(provider);
            const accounts = await library.listAccounts();
            const network = await library.getNetwork();
            setProvider(provider);
            setLibrary(library);
            if (accounts) {
                setAccount(accounts[0]);
                walletContext.setAccount(accounts[0]);
            }
            setChainId(network.chainId);

            const web3Instance = await getWeb3();
            walletContext.setWeb3Instance(web3Instance);

            const stakingContractInstance = new web3Instance.eth.Contract(
                Contracts.stakingContract.ABI,
                Contracts.stakingContract.address
            );
            walletContext.setStakingContract(stakingContractInstance);

            const satsTokenContractInstance = new web3Instance.eth.Contract(
                Contracts.satsTokenContract.ABI,
                Contracts.satsTokenContract.address
            );
            walletContext.setSATsTokenContract(satsTokenContractInstance);
        } catch (error) {
            console.error("error:", error);
            setError(error);
        }
    };

    const refreshState = () => {
        setAccount("");
        walletContext.setAccount("");
        setChainId(null);
        setNetwork(null);
        setMessage("");
        setSignature("");
        setVerified(undefined);
    };

    const disconnect = async () => {
        await web3Modal.clearCachedProvider();
        refreshState();
    };

    useEffect(() => {
        if (web3Modal.cachedProvider) {
            connectWallet();
        }
    }, []);

    useEffect(() => {
        if (provider?.on) {
            const handleAccountsChanged = (accounts: any) => {
                console.log("accountsChanged", accounts);
                if (accounts) setAccount(accounts[0]);
            };

            const handleChainChanged = (_hexChainId: any) => {
                setChainId(_hexChainId);
            };

            const handleDisconnect = () => {
                console.log("disconnect", error);
                disconnect();
            };

            provider.on("accountsChanged", handleAccountsChanged);
            provider.on("chainChanged", handleChainChanged);
            provider.on("disconnect", handleDisconnect);

            return () => {
                if (provider.removeListener) {
                    provider.removeListener(
                        "accountsChanged",
                        handleAccountsChanged
                    );
                    provider.removeListener("chainChanged", handleChainChanged);
                    provider.removeListener("disconnect", handleDisconnect);
                }
            };
        }
    }, [provider]);

    return (
        <Flex
            padding={"10px"}
            display={"flex"}
            alignItems={"center"}
            justifyContent={"space-between"}
            mb={"20px"}
        >
            <Link to={PATH.HOME}>
                <Button
                    display={"flex"}
                    alignItems={"center"}
                    justifyContent={"center"}
                    width={"150px"}
                    height={"60px"}
                    overflow={"hidden"}
                    backgroundImage={ButtonImage}
                    fontSize={"14px"}
                    border={"none"}
                    backgroundRepeat={"no-repeat"}
                    backgroundSize={"cover"}
                >
                    SATOSHI BANK
                </Button>
            </Link>
            <Image src={Logo} width={"50px"} alt="logo" />
            <Button
                display={"flex"}
                alignItems={"center"}
                justifyContent={"center"}
                width={"150px"}
                height={"60px"}
                overflow={"hidden"}
                backgroundImage={ButtonImage}
                fontSize={"14px"}
                border={"none"}
                backgroundRepeat={"no-repeat"}
                backgroundSize={"cover"}
                onClick={() => {
                    if (!account) {
                        connectWallet();
                    } else {
                        disconnect();
                    }
                }}
            >
                {!account ? "Connect Wallet" : account}
            </Button>
        </Flex>
    );
};

export default HeaderComponent;
