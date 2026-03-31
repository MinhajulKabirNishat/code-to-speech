import * as vscode from 'vscode';
import say = require('say');

const highlightDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
    isWholeLine: true,
    border: '1px solid yellow'
});

let isSpeaking = false;
let currentTimer: NodeJS.Timeout | undefined; 

export function activate(context: vscode.ExtensionContext) {
    
    let readDisposable = vscode.commands.registerCommand('code-to-speech.readCode', async () => {
        if (isSpeaking) {
            vscode.window.showWarningMessage('Already reading! Stop first to restart.');
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        isSpeaking = true;
        const document = editor.document;

        for (let i = 0; i < document.lineCount; i++) {
        
            if (!isSpeaking) break;

            const line = document.lineAt(i);
            const text = line.text.trim();

            if (text.length > 0) {
                const range = new vscode.Range(i, 0, i, line.text.length);
                editor.setDecorations(highlightDecorationType, [range]);
                editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

                say.speak(text);

                const estimatedMs = Math.max(1500, text.length * 80);
                
               
                await new Promise((resolve) => {
                    currentTimer = setTimeout(resolve, estimatedMs);
                });
            }
        }

       
        isSpeaking = false;
        editor.setDecorations(highlightDecorationType, []);
    });

    let stopDisposable = vscode.commands.registerCommand('code-to-speech.stopReading', () => {
        isSpeaking = false;
        
   
        say.stop(); 
        
        
        if (currentTimer) {
            clearTimeout(currentTimer);
            currentTimer = undefined;
        }
        
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.setDecorations(highlightDecorationType, []);
        }
        
        vscode.window.showInformationMessage('Speech stopped.');
    });

    context.subscriptions.push(readDisposable);
    context.subscriptions.push(stopDisposable);
}

export function deactivate() {
    isSpeaking = false;
    say.stop();
}