async function main() {
  const url = process.env.HEALTHCHECK_URL;

  if (url == null) {
    throw new Error("Healthcheck url is required");
  }

  const res = await fetch(url, {
    headers: {
      Authorization: process.env.HEALTHCHECK_TOKEN || "",
    },
  });

  if (!res.ok) {
    throw new Error(`Request failed with status ${res.status}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const json = await res.json();
  console.log(json);
}

main().catch(console.error);
