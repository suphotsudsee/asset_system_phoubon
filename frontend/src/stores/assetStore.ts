import { create } from 'zustand'
import { Asset } from '../types'

interface AssetStore {
  assets: Asset[]
  total: number
  page: number
  pageSize: number
  setAssets: (assets: Asset[], total: number, page: number, pageSize: number) => void
  addAsset: (asset: Asset) => void
  updateAsset: (id: number, asset: Partial<Asset>) => void
  deleteAsset: (id: number) => void
  reset: () => void
}

export const useAssetStore = create<AssetStore>((set) => ({
  assets: [],
  total: 0,
  page: 1,
  pageSize: 10,
  setAssets: (assets, total, page, pageSize) => set({ assets, total, page, pageSize }),
  addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset], total: state.total + 1 })),
  updateAsset: (id, asset) =>
    set((state) => ({
      assets: state.assets.map((a) => (a.id === id ? { ...a, ...asset } : a)),
    })),
  deleteAsset: (id) => set((state) => ({ assets: state.assets.filter((a) => a.id !== id), total: state.total - 1 })),
  reset: () => set({ assets: [], total: 0, page: 1, pageSize: 10 }),
}))
