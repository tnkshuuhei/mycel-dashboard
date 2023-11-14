import { useState, useEffect } from "react";
import { useClient } from "../hooks/useClient";
import { useNavigate } from "react-router-dom";
import { RegistryDomain } from "mycel-client-ts/mycel.registry/rest";
import { useAddressContext } from "../def-hooks/addressContext";
import { IgntButton } from "@ignt/react-library";
import { DeliverTxResponse } from "@cosmjs/stargate";
import { PencilRuler } from "lucide-react";
import TxModal from "../components/TxModal";
import ResolveButton from "../components/ResolveButton";

export default function RegisterView() {
  const client = useClient();
  const navigate = useNavigate();
  const { address } = useAddressContext();
  const [query, setQuery] = useState<string>("");
  const [isRegistable, setIsRegistable] = useState<boolean>(false);
  const [domain, setDomain] = useState<RegistryDomain>();
  const [isShow, setIsShow] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [txResponse, setTxResponse] = useState<DeliverTxResponse>();

  const getDomain = async () => {
    await client.MycelRegistry.query
      .queryDomain(query, "cel")
      .then((res) => setDomain(res.data.domain))
      .catch(() => {
        setDomain(undefined);
      });
  };

  useEffect(() => {
    getDomain();
    // queried domain is not registered
    if (!domain && query !== "") {
      setIsRegistable(true);
    } else {
      setIsRegistable(false);
    }
  }, [query, domain]);

  const registerDomain = async () => {
    setIsLoading(true);
    setIsShow(true);
    await client.MycelRegistry.tx
      .sendMsgRegisterDomain({
        value: {
          creator: address,
          name: query,
          parent: "cel",
          registrationPeriodInYear: 1,
        },
      })
      .then((res) => {
        setIsLoading(false);
        setTxResponse(res as DeliverTxResponse);
      })
      .catch(() => {
        setIsShow(false);
      });
  };

  return (
    <>
      <div className="container my-12">
        <h2 className="font-cursive text-3xl text-black font-semibold mb-6 flex items-center">
          <PencilRuler className="opacity-70 mr-2" size={28} />
          Register
        </h2>
        <div className="flex mt-2 mb-10">
          <input
            className="mt-1 py-2 px-4 h-14 bg-white w-full border border-black text-base leading-tight outline-0"
            placeholder=".cel"
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
        </div>
        {isRegistable ? (
          <div className="border-t border-b border-dashed border-black py-8 px-4">
            <div className="w-full flex justify-between">
              <h2 className=" text-2xl m-2 font-semibold">{query + ".cel"}</h2>
              <button disabled={!address} onClick={registerDomain} className="btn-primary w-40 py-1">
                Register
              </button>
            </div>
            {!address && <p className="text-error m-2 font-semibold">Please connect wallet first</p>}
          </div>
        ) : domain ? (
          <div className="border-t border-b border-dashed border-black py-8 px-4">
            <div className="w-full flex justify-between">
              <h2 className=" text-2xl m-2 font-semibold">{domain.name + "." + domain.parent}</h2>

              <ResolveButton name={domain.name} parent={domain.parent} />
            </div>
          </div>
        ) : (
          <div></div>
        )}
      </div>
      <TxModal
        isShow={isShow}
        setIsShow={setIsShow}
        txResponse={txResponse}
        isLoading={isLoading}
        onClosed={() => {
          navigate(`/resolve?name=${query}&parent=${"cel"}`);
        }}
      />
    </>
  );
}
