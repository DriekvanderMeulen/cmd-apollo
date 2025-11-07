"use client";

import { useEffect, useState, useTransition } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { HiMiniMagnifyingGlass } from "react-icons/hi2";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { toast } from "react-hot-toast";

import { Button, Spinner } from "@/components/ui";

type ObjectRow = {
	id: number;
	publicId: string;
	title: string;
	collection: string;
	author: string;
	public: boolean;
};

async function apiGet(path: string) {
	const res = await fetch(path, { cache: "no-store" });
	if (!res.ok) throw new Error("Request failed");
	return res.json();
}

async function apiJson(path: string, method: "POST", body?: unknown) {
	const res = await fetch(path, {
		method,
		headers: { "Content-Type": "application/json" },
		body: body ? JSON.stringify(body) : undefined,
	});
	if (!res.ok) {
		const error = await res.json().catch(() => ({ error: "Request failed" }));
		throw new Error(error.error || "Request failed");
	}
	return res.json();
}

function listObjects(params: { page: number; pageSize: number; q: string }) {
	const qs = new URLSearchParams({
		page: String(params.page),
		pageSize: String(params.pageSize),
		q: params.q,
	});
	return apiGet(`/api/v1/editor/objects?${qs.toString()}`);
}

function mintQRLink(objectId: number, expiresInHours?: number) {
	return apiJson("/api/v1/editor/qr-links", "POST", { objectId, expiresInHours });
}

const PAGE_SIZE = 10;

function Pager({
	page,
	total,
	onPage,
}: {
	page: number;
	total: number;
	onPage: (p: number) => void;
}) {
	const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
	return (
		<div className="flex items-center space-x-2">
			<button
				className="px-3 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
				onClick={() => onPage(Math.max(1, page - 1))}
				disabled={page <= 1}
			>
				Prev
			</button>
			<span className="text-sm text-neutral-600">
				Page {page} of {totalPages}
			</span>
			<button
				className="px-3 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
				onClick={() => onPage(Math.min(totalPages, page + 1))}
				disabled={page >= totalPages}
			>
				Next
			</button>
		</div>
	);
}

function QRDialog({
	isOpen,
	url,
	onClose,
}: {
	isOpen: boolean;
	url: string | null;
	onClose: () => void;
}) {
	if (!isOpen || !url) return null;

	const handleDownload = () => {
		const canvas = document.querySelector('canvas[data-qr="true"]') as HTMLCanvasElement;
		if (!canvas) return;
		const link = document.createElement("a");
		link.download = `qr-code-${Date.now()}.png`;
		link.href = canvas.toDataURL("image/png");
		link.click();
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
			<div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
				<h3 className="text-lg font-semibold text-neutral-900">QR Code</h3>
				<div className="flex justify-center">
					<div className="hidden">
						<QRCodeCanvas value={url} size={256} data-qr="true" />
					</div>
					<QRCodeSVG value={url} size={256} />
				</div>
				<div className="text-sm text-neutral-600 break-all">{url}</div>
				<div className="flex gap-2">
					<Button title="Download" onClick={handleDownload} />
					<Button title="Close" variant="secondary-gray" onClick={onClose} />
				</div>
			</div>
		</div>
	);
}

export function QRGeneratorPanel() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const page = Number(searchParams.get("page") || "1");
	const [items, setItems] = useState<Array<ObjectRow>>([]);
	const [total, setTotal] = useState(0);
	const [query, setQuery] = useState("");
	const [qrUrl, setQrUrl] = useState<string | null>(null);
	const [isQROpen, setIsQROpen] = useState(false);
	const [generatingId, setGeneratingId] = useState<number | null>(null);

	const setParam = (key: string, value: string | null) => {
		const params = new URLSearchParams(searchParams.toString());
		if (value) params.set(key, value);
		else params.delete(key);
		router.push(`/editor/qr-gen?${params.toString()}`);
	};

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const res = await listObjects({
					page,
					pageSize: PAGE_SIZE,
					q: query,
				});
				if (cancelled) return;
				setItems(res.items);
				setTotal(res.total);
			} catch (e) {
				if (!cancelled) toast.error("Failed to load objects");
			}
		})();
		return () => {
			cancelled = true;
		};
	}, [page, query]);

	const handleGenerateQR = (objectId: number) => {
		setGeneratingId(objectId);
		startTransition(() => {
			(async () => {
				try {
					const res = await mintQRLink(objectId, 1);
					setQrUrl(res.url);
					setIsQROpen(true);
					toast.success("QR code generated");
				} catch (e) {
					toast.error(e instanceof Error ? e.message : "Failed to generate QR code");
				} finally {
					setGeneratingId(null);
				}
			})();
		});
	};

	return (
		<>
			<div className="space-y-6">
				<div>
					<h1 className="text-3xl font-semibold text-neutral-900">QR gen</h1>
					<p className="text-neutral-600 mt-1.5 text-[15px]">
						Generate QR codes for objects to share via universal links.
					</p>
				</div>

				<div className="space-y-4">
					<form
						onSubmit={(e) => {
							e.preventDefault();
							setParam("page", "1");
						}}
						className="relative"
					>
						<div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
							<HiMiniMagnifyingGlass size={18} />
						</div>
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							className="h-9 w-80 rounded-md pl-9 pr-3 border border-neutral-200 text-sm focus:border-neutral-300 focus:ring-1 focus:ring-accent/20 outline-none placeholder:text-neutral-400 transition-colors"
							placeholder="Search objects..."
						/>
					</form>

					<div className="overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
						<table className="min-w-full">
							<thead className="bg-neutral-50/60 border-b border-neutral-200">
								<tr>
									<th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600">
										Title
									</th>
									<th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600">
										Collection
									</th>
									<th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600">
										Author
									</th>
									<th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600">
										Visibility
									</th>
									<th className="px-5 py-3 text-left text-xs font-semibold text-neutral-600">
										Actions
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-neutral-200/60">
								{items.length === 0 ? (
									<tr>
										<td
											colSpan={5}
											className="px-5 py-12 text-center text-sm text-neutral-500"
										>
											No results.
										</td>
									</tr>
								) : (
									items.map((item) => (
										<tr
											key={item.id}
											className="hover:bg-neutral-50/50 transition-colors"
										>
											<td className="px-5 py-3.5 text-sm font-medium text-neutral-800">
												{item.title}
											</td>
											<td className="px-5 py-3.5 text-sm text-neutral-600">
												{item.collection}
											</td>
											<td className="px-5 py-3.5 text-sm text-neutral-600">
												{item.author}
											</td>
											<td className="px-5 py-3.5 text-sm text-neutral-600">
												{item.public ? (
													<span className="text-green-600">Public</span>
												) : (
													<span className="text-neutral-500">Private</span>
												)}
											</td>
											<td className="px-5 py-3.5">
												<button
													className="px-2.5 py-1.5 rounded-md text-sm font-medium hover:bg-neutral-100 transition-colors disabled:opacity-40"
													onClick={() => handleGenerateQR(item.id)}
													disabled={isPending || generatingId === item.id}
												>
													{generatingId === item.id ? (
														<Spinner size={14} />
													) : (
														"Generate QR"
													)}
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					<div className="flex items-center justify-between text-sm text-neutral-600">
						<span>
							Showing {items.length} of {total}
						</span>
						<Pager page={page} total={total} onPage={(p) => setParam("page", String(p))} />
					</div>
				</div>
			</div>

			<QRDialog isOpen={isQROpen} url={qrUrl} onClose={() => setIsQROpen(false)} />
		</>
	);
}

