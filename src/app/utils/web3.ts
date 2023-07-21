function shortenedAddress(address: string): string {
  return address.substring(0, 6) + '...' + address.substring(38, 42);
}

export default { shortenedAddress };
