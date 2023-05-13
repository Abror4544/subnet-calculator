const MAX_IP = 255;
const MIN_IP = 0;
const MAX_PREFIX = 32;
const MAX_IP_PARTS = 4;

const convertToOctetBinary = (decimal) => {
  return parseInt(decimal).toString(2).padStart(8, "0");
};

function replaceBinary(binaryIp, prefix, value) {
  return binaryIp
    .map((number, index, arr) => {
      const result = index >= Number(prefix) ? value : number;
      return (index + 1) % 8 === 0 && index !== arr.length - 1
        ? result + "."
        : result;
    })
    .join("")
    .split(".")
    .map((octet) => parseInt(octet, 2))
    .join(".");
}

const getFirstOrLastUsableIp = (ip, type) => {
  const octets = ip.split(".");
  const lastOctet = octets.at(-1);
  const usable = type === "first" ? +lastOctet + 1 : +lastOctet - 1;
  return octets.slice(0, 3).join(".") + "." + usable;
};

const calculate = (input) => {
  const inputValue = input.value;
  const ipParts = inputValue.split(".");
  const [address, prefix] = inputValue.split("/");

  const validation =
    ipParts.length === MAX_IP_PARTS &&
    inputValue.includes("/") &&
    address.split(".").every((part) => {
      const num = Number(part);
      return !isNaN(num) && num >= MIN_IP && num <= MAX_IP;
    }) &&
    +prefix <= MAX_PREFIX;

  if (!validation) {
    input.classList.add("error");
    return;
  }

  input.classList.remove("error");

  const binaryIpBits = address
    .split(".")
    .map((octet) => {
      return convertToOctetBinary(Number(octet));
    })
    .join("")
    .split("");

  const network = replaceBinary(binaryIpBits, prefix, "0");
  const broadcast = replaceBinary(binaryIpBits, prefix, "1");
  const firstUsable = getFirstOrLastUsableIp(network, "first");
  const lastUsable = getFirstOrLastUsableIp(broadcast, "last");
  const numberOfHosts = 2 ** (MAX_PREFIX - Number(prefix)) - 2;

  return { network, broadcast, firstUsable, lastUsable, numberOfHosts };
};

const renderResults = (results) => {
  if (!results) return;
  const { network, broadcast, firstUsable, lastUsable, numberOfHosts } =
    results;
  document.querySelector("#network").textContent = network;
  document.querySelector("#broadcast").textContent = broadcast;
  document.querySelector("#firstUsable").textContent = firstUsable;
  document.querySelector("#lastUsable").textContent = lastUsable;
  document.querySelector("#numberOfHosts").textContent = numberOfHosts;
};

document.querySelector("#calculate").addEventListener("click", () => {
  renderResults(calculate(document.querySelector("#ip")));
});
