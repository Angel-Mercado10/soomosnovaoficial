import type { Foto } from './database'

declare global {
  interface Window {
    __albumSetFotos?: React.Dispatch<React.SetStateAction<Foto[]>>
  }
}
