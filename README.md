# Installation:
`yarn add @reincarnatedjesus/f-chain` <br>
`npm i @reincarnatedjesus/f-chain`
# Usage:
## Example
```ts
import {createChainedFunction, Context} from "@reincarnatedjesus/f-chain"

const rootFn = (myNum: number) => {
    return myNum
}

const chain = {
    add: (ctx: Context, numToAdd: number) => {
        const root = ctx.getRoot<number>() //get the return of rootFn
        ctx.setResult(root + numToAdd) //if nothing is returned from a chain function, then the chain will be returned automatically
    },
    subtract: (ctx: Context, numToSub: number) => {
        //get the return of the last chain function executed (if there wasn't any then this method is the same as ctx.getRoot) 
        const last = ctx.getLast<number>() 
        ctx.setResult(last - numToSub)
    },
    getLast: (ctx: Context) => ctx.getLast<number>(),
    getSub: (ctx: Context) => ctx.get<number>("subtract"), //will return the result of chain.subtract() (if it was called before)
    getAdd: (ctx: Context) => ctx.get<number>("add") //will return the result of chain.add() (if it was called before)
}

const chainedFunction = createChainedFunction(rootFn, chain)
const chainRes = chainedFunction(11)
const subRes = chainRes.subtract(10).getSub() //context param is omitted by the type system, only the arguments after are shown
chainRes.add(10)
chainRes.subtract(5)
console.log(subRes, chainRes.getAdd(), chainRes.getSub()) //1, 21, 16
```
## Creating chained functions
Every chained function has to be created with the `createChainedFunction` function. <br>
##### Usage: 
`createChainedFunction(executor: Function, chain: Record<string, (ctx: Context, ...args: any) => any>)`
### About the chain
Even though every chain function accepts the context argument, when calling the function the type system will omit that parameter. <br>
For example, if you have a chain function like this: `(ctx: Context, arg1: string, arg2: number) => ...`, when calling it this will appear in your IDE's intellisense: `(arg1: string, arg2: number) => ...` <br> <br>
A function declaration like this: <br>
![Function declaration](https://i.file.glass/nnstNN1tlq.png) <br> 
Will be shown as: <br>
![Function call](https://i.file.glass/TQzwD3VJVM.png)

## Context object
##### Methods:
`getLast`: Returns the last value in the chain or the return of the root function <br>
`get`: Returns a specific function's return in the chain (`ctx.get("myChainFunction")`) <br>
`getRoot`: Returns the result of the root function <br>
`setResult`: Sets a function's result, (used to avoid returning a value so the chain is automatically returned again) <br>
`setValue`: Sets a value in the context that can be resolved with `context.get(key)` <br>
