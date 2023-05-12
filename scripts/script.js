const MAX_IP = 255;
const MIN_IP = 0;
const MAX_PREFIX = 32;
const MAX_IP_PARTS = 4;

const convertToOctetBinary = (decimal) => {
  return parseInt(decimal).toString(2).padStart(8, "0");
};

const replacer = (binaryIp, prefix, value) => {
  return binaryIp
    .map((number, index, arr) => {
      let result;

      if (index >= Number(prefix)) {
        result = value;
      } else {
        result = number;
      }

      if ((index + 1) % 8 === 0 && index !== arr.length - 1) {
        result += ".";
      }

      return result;
    })
    .join("")
    .split(".")
    .map((octet) => {
      return parseInt(octet, 2);
    })
    .join(".");
};

const getFirstOrLastUsableIp = (ip, type) => {
  const octets = ip.split(".");
  const lastOctet = octets.at(-1);
  let usable;
  switch (type) {
    case "first":
      usable = +lastOctet + 1;
      break;
    case "last":
      usable = +lastOctet - 1;
      break;
  }

  return octets.slice(0, 3).join(".") + "." + usable;
};

document.querySelector("#calculate").addEventListener("click", () => {
  const input = document.querySelector("#ip");
  const inputValue = input.value;
  const validation =
    !!inputValue.length &&
    inputValue.includes(".") &&
    inputValue.split(".").length === MAX_IP_PARTS &&
    inputValue.includes("/") &&
    +inputValue.split("/")[1] + "" !== "NaN" &&
    !inputValue
      .split("/")[0]
      .split(".")
      .find((octet) => {
        return +octet + "" === "NaN" || +octet > MAX_IP || +octet < MIN_IP;
      }) &&
    +inputValue.split("/")[1] <= MAX_PREFIX;

  if (!validation) {
    input.classList.add("error");
    return;
  }

  input.classList.remove("error");
  const [address, prefix] = inputValue.split("/");
  const binaryIp = address
    .split(".")
    .map((octet) => {
      return convertToOctetBinary(Number(octet));
    })
    .join("")
    .split("");

  const network = replacer(binaryIp, prefix, "0");
  const broadcast = replacer(binaryIp, prefix, "1");
  const firstUsable = getFirstOrLastUsableIp(network, "first");
  const lastUsable = getFirstOrLastUsableIp(broadcast, "last");
  const numberOfHosts = 2 ** (MAX_PREFIX - Number(prefix)) - 2;

  document.querySelector("#network").textContent = network;
  document.querySelector("#broadcast").textContent = broadcast;
  document.querySelector("#firstUsable").textContent = firstUsable;
  document.querySelector("#lastUsable").textContent = lastUsable;
  document.querySelector("#numberOfHosts").textContent = numberOfHosts;
});
