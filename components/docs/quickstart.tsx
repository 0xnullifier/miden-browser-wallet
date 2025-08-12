import { InstallComponent } from "@/components/docs/install-code"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"


const packageManagers = [
    {
        id: "npm",
        label: "npm",
        command: "npm install @demox-labs/miden-sdk"
    },
    {
        id: "yarn",
        label: "yarn",
        command: "yarn add @demox-labs/miden-sdk"
    },
    {
        id: "pnpm",
        label: "pnpm",
        command: "pnpm add @demox-labs/miden-sdk"
    }
]

export function QuickStart() {
    return (
        <div className="flex flex-col mx-auto">
            <p className="text-3xl font-bold">Quickstart</p>
            <div className="py-4"> The <a href="https://0xmiden.github.io/miden-docs/imported/miden-tutorials/src/web-client/about.html" className="text-primary underline underline-offset-2 cursor-pointer">Miden Web Client</a> is the easiest way to interact with the miden blockchain. The web client handles everything from account creation, creating and consuming notes, signing and sending transactions. </div>

            <p className="text-xl font-bold py-4">Installation</p>
            <div className="text-muted-foreground ">Install the Web client</div>
            <InstallComponent
                packageManagers={packageManagers}
            />
            <p className="text-xl font-bold pt-8 pb-4" id="#accounts">Accounts</p>
            <div className="text-muted-foreground"> Accounts on miden are </div>
            <Accordion type="single" collapsible className="border rounded-md px-4 mt-4">
                <AccordionItem value="item-1">
                    <AccordionTrigger className="text-primary text-md underline-offset-4">What do you mean by receive?</AccordionTrigger>
                    <AccordionContent className="border-t pt-2 text-md">
                        In other chains
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}