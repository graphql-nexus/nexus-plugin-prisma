import { scan, takeWhile, takeUntil } from 'rxjs/operators'
import { timer } from 'rxjs'

export const takeUntilServerListening = takeWhile((data: string) => !data.includes('server listening'))

export const timeUntilTimeout = (second: number) => takeUntil(timer(second * 1000))

export const bufferOutput = scan((buffer: string, data: string) => buffer + data, '')
