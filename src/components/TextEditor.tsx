// components/PropertiesPanel.tsx

import AceEditor from "react-ace";

import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/theme-cobalt";
import "ace-builds/src-noconflict/ext-language_tools";

const TextEditor = () => {
    return (
        <AceEditor
            setOptions={{ useWorker: false }}
            mode="javascript"
            theme="cobalt"
            onChange={(e) => console.log(e)}
            name="editor"
            editorProps={{ $blockScrolling: true }}
            height="100%"
            width="100%"
            showPrintMargin={false}
        />
    );
};

export default TextEditor;
