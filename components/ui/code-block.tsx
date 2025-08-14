"use client";
import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight, oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { IconCheck, IconCopy } from "@tabler/icons-react";

type CodeBlockProps = {
    language: string;
    filename: string;
    highlightLines?: number[];
} & (
        | {
            code: string;
            tabs?: never;
        }
        | {
            code?: never;
            tabs: Array<{
                name: string;
                code: string;
                language?: string;
                highlightLines?: number[];
            }>;
        }
    );

export const CodeBlock = ({
    language,
    filename,
    code,
    highlightLines = [],
    tabs = [],
}: CodeBlockProps) => {
    const [copied, setCopied] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState(0);
    const [isDark, setIsDark] = React.useState(false);

    const tabsExist = tabs.length > 0;

    // Check if we're in dark mode by checking the document class
    React.useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };

        checkDarkMode();

        // Watch for class changes
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, []);

    const copyToClipboard = async () => {
        const textToCopy = tabsExist ? tabs[activeTab].code : code;
        if (textToCopy) {
            await navigator.clipboard.writeText(textToCopy);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const activeCode = tabsExist ? tabs[activeTab].code : code;
    const activeLanguage = tabsExist
        ? tabs[activeTab].language || language
        : language;
    const activeHighlightLines = tabsExist
        ? tabs[activeTab].highlightLines || []
        : highlightLines;

    return (
        <div className="relative w-full max-w-[50rem] rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 font-mono text-sm">
            <div className="flex flex-col gap-2 pb-2">
                {tabsExist && (
                    <div className="flex justify-between items-center">
                        <div className="flex overflow-x-auto">
                            {tabs.map((tab, index) => (
                                <button
                                    key={index}
                                    onClick={() => setActiveTab(index)}
                                    className={`px-3 !py-2 text-xs transition-colors font-sans border-b-2 ${activeTab === index
                                        ? "text-gray-900 dark:text-white border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 border-transparent"
                                        }`}
                                >
                                    {tab.name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-sans ml-4"
                        >
                            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                        </button>
                    </div>
                )}
                {!tabsExist && filename && (
                    <div className="flex justify-between items-center py-2">
                        <div className="text-xs text-gray-500 dark:text-gray-400">{filename}</div>
                        <button
                            onClick={copyToClipboard}
                            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-sans"
                        >
                            {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                        </button>
                    </div>
                )}
            </div>
            <SyntaxHighlighter
                language={activeLanguage}
                style={isDark ? oneDark : oneLight}
                customStyle={{
                    margin: 0,
                    padding: 0,
                    background: "transparent",
                    fontSize: "0.875rem", // text-sm equivalent
                }}
                wrapLines={true}
                showLineNumbers={true}
                lineProps={(lineNumber) => ({
                    style: {
                        backgroundColor: activeHighlightLines.includes(lineNumber)
                            ? "rgba(255,255,255,0.1)"
                            : "transparent",
                        display: "block",
                        width: "100%",
                    },
                })}
                PreTag="div"
            >
                {String(activeCode)}
            </SyntaxHighlighter>
        </div>
    );
};
