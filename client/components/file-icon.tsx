import {
    AppWindowMac,
    Clapperboard,
    CodeXml,
    Database,
    File,
    FileArchive,
    FileJson,
    FileTerminal,
    Image,
    KeyRound,
    Music4,
    Pilcrow,
    Text,
} from 'lucide-preact';
import { mimes } from 'mrmime';
import languages from 'linguist-languages';
import type { JSX } from 'preact';

const mimeTypes = Object.fromEntries(
    Object.entries(mimes).map(([key, value]) => [value, key])
);

function getMimeType(mime: string) {
    return Object.keys(mimeTypes)
        .filter((mimeType) => mimeType.startsWith(mime))
        .map((mimeType) => mimeTypes[mimeType]!);
}

const icons: { extensions: string[]; icon: JSX.Element }[] = [
    {
        extensions: getMimeType('video'),
        icon: <Clapperboard className="text-red-5" />,
    },
    {
        extensions: getMimeType('image'),
        icon: <Image className="text-green-5" />,
    },
    {
        extensions: getMimeType('audio'),
        icon: <Music4 className="text-purple-6" />,
    },
    {
        extensions: ['zip', '7z'],
        icon: <FileArchive className="text-#80573d" />,
    },
    {
        extensions: ['exe', 'msi'],
        icon: <AppWindowMac />,
    },
    {
        extensions: ['bat', 'sh', 'batch'],
        icon: <FileTerminal className="text-#262b25" />,
    },
    {
        extensions: ['env', 'local'],
        icon: <KeyRound className="text-#F0DB4F" />,
    },
    {
        extensions: ['json', 'json5'],
        icon: <FileJson className="text-#F0DB4F" />,
    },
];

Object.keys(languages).forEach((language) => {
    const langData = languages[language as keyof typeof languages];

    if (!langData.extensions?.length) return;

    const langType = langData.type as
        | 'programming'
        | 'data'
        | 'markup'
        | 'prose';
    const color = langData.color || '#007ACC';

    let icon: JSX.Element;

    switch (langType) {
        case 'data': {
            icon = <Database style={{ color }} />;
            break;
        }
        case 'markup': {
            icon = <Text style={{ color }} />;
            break;
        }
        case 'prose': {
            icon = <Pilcrow style={{ color }} />;
            break;
        }
        case 'programming':
        default: {
            icon = <CodeXml style={{ color }} />;
            break;
        }
    }

    const iconData = {
        extensions: langData.extensions.map((ext) => ext.substring(1)),
        icon,
    };

    icons.push(iconData);
});

export function FileIcon({ extension = '' }: { extension?: string }) {
    const Icon: JSX.Element = icons.find(({ extensions }) =>
        extensions.includes(extension)
    )?.icon || <File className="text-gray-5" />;

    return Icon;
}
