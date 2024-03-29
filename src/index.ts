export type ArgumentTypes<F extends Function> = F extends (...args: infer A) => any ? A : never;
export type DropFirst<T extends any[]> = ((...args: T) => any) extends (arg: any, ...rest: infer U) => any ? U : T;
export type ChainType = Record<string, (ctx: Context, ...args: any) => any>

export type ExcludedChain<Chain extends ChainType> = {
    [P in keyof Chain]: (...args: DropFirst<ArgumentTypes<Chain[P]>>) => ReturnType<Chain[P]> extends void ? ExcludedChain<Chain> : ReturnType<Chain[P]>
}

export interface Context {
    getLast: <T extends unknown>() => T
    get: <T extends unknown>(key: string) => T
    getRoot: <T extends unknown>() => T
    setResult: (res: any) => void
    setValue: (key: string, val: any) => void
}

export function createChainedFunction
<Fn extends Function, Chain extends ChainType>(executor: Fn, chain: Chain): (...args: ArgumentTypes<Fn>) => ExcludedChain<Chain> {
    const context = new Map<keyof Chain, any>()


    const createProxiedChain = (doneCh?: ExcludedChain<Chain>): ExcludedChain<Chain> => {
        const ret = {}
        for (const [k, v] of Object.entries(chain)) {
            const contextObj: Context = {
                get: (key: string) => context.get(key),
                getRoot: () => context.get("|||___root___||"),
                getLast: () => context.get("|||___last___||"),
                setResult: (value: any) => context.set(k, value),
                setValue: (key: string, val: any) => context.set(key, val)
            }
            ret[k] = (...args: ArgumentTypes<typeof v>) => {
                if (doneCh) {
                    const res = v(contextObj, ...args)
                    context.set("|||___last___||", res || contextObj.get(k))
                    if (res !== undefined && res !== null) {
                        return res
                    } 
                    return doneCh
                } else {
                    return v(contextObj, ...args)
                }
            }
        }
        return ret as ExcludedChain<Chain>
    }
    return (...args: ArgumentTypes<Fn>) => {
        const retv = executor(...args)
        context.set("|||___root___||", retv)
        context.set("|||___last___||", retv)
        const ch1 = createProxiedChain()
        return  createProxiedChain(ch1) as ExcludedChain<Chain>
    }
}
