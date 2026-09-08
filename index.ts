import { Database } from "bun:sqlite";
import { mkdir } from "node:fs/promises";
import { write } from "bun";

const RESOURCE_HOST = "https://asset-starlight-stage.akamaized.net";
const DATA_HOST = "https://starlight.kirara.ca";

const manifestDB = new Database("./data/manifest.db");
const masterDB = new Database("./data/master.db");

const allCards = masterDB.query("SELECT id FROM card_data").all() as {
	id: number;
}[];

const getTranslation = async (strings: string[]) => {
	try {
		const response = await fetch(`${DATA_HOST}/api/v1/read_tl`, {
			method: "POST",
			body: JSON.stringify(strings),
		});

		if (!response.ok) throw new Error("Cannot get translation");

		return (await response.json()) as Record<string, string>;
	} catch (e) {
		console.error((e as Error).message);
		return null;
	}
};

const getCardData = async (id: number) => {
	try {
		const response = await fetch(`${DATA_HOST}/api/v1/card_t/${id}`);

		if (!response.ok) {
			throw new Error(
				`Cannot get data for card with ID: ${id}\t${response.status}`,
			);
		}

		return (
			(await response.json()) as {
				result: {
					title: string;
					chara: { conventional: string };
				}[];
			}
		).result[0];
	} catch (e) {
		console.error((e as Error).message);
		return null;
	}
};

const getAsset = async (hash: string) => {
	try {
		const response = await fetch(
			`${RESOURCE_HOST}/dl/resources/AssetBundles/${hash.slice(0, 2)}/${hash}`,
			{
				headers: {
					"User-Agent":
						"Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)",
					"X-Unity-Version": "2018.3.8f1",
					"Accept-Encoding": "gzip",
					Connection: "Keep-Alive",
				},
			},
		);

		if (!response.ok)
			throw new Error(`Cannot download file with hash: ${hash}`);

		return await response.blob();
	} catch (e) {
		console.error((e as Error).message);
		return null;
	}
};

const processCard = async (id: number) => {
	try {
		const data = await getCardData(id);
		if (!data) throw new Error(`Cannot get data for ID: ${id}. Skipping...`);

		if (!data.title) return false;

		const translation = await getTranslation([data.title]);
		const basePath = `./output/${data.chara.conventional}/${(translation && Object.values(translation)[0]) || data.title}`;
		await mkdir(basePath, { recursive: true });

		const assetsManifest = manifestDB
			.query(
				`SELECT * FROM manifests WHERE name LIKE '%${id}%' AND name LIKE '%.unity3d'`,
			)
			.all() as { name: string; hash: string }[];

		const assets = await Promise.all(
			assetsManifest.map(async ({ name, hash }) => ({
				name,
				hash,
				blob: await getAsset(hash),
			})),
		);

		for (const { name, blob } of assets) {
			if (!blob) continue;
			const filePath = `${basePath}/${name}`;

			try {
				await write(filePath, blob);
			} catch {
				console.error(`Cannot write to ${filePath}`);
			}
		}

		return true;
	} catch (e) {
		console.error((e as Error).message);
		return false;
	}
};

for (const { id } of allCards) {
	await processCard(id);
}
