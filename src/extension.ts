import * as vscode from 'vscode';
import say = require('say');

const highlightDecorationType = vscode.window.createTextEditorDecorationType({
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
    isWholeLine: true,
    border: '1px solid yellow'
});

let isSpeaking = false;
let isMuted = false; 
let currentTimer: any;
let myStatusBarItem: vscode.StatusBarItem;

export function activate(context: vscode.ExtensionContext) {

    
    myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    myStatusBarItem.command = 'code-to-speech.readCode';
    myStatusBarItem.text = `$(play) Read Code`;
    myStatusBarItem.show();
    context.subscriptions.push(myStatusBarItem);

    
    let muteDisposable = vscode.commands.registerCommand('code-to-speech.toggleMute', () => {
        isMuted = !isMuted;
        if (isMuted) {
            say.stop();
            vscode.window.showInformationMessage('Voice Muted (Visual Only)');
        } else {
            vscode.window.showInformationMessage('Voice Unmuted');
        }
    });

    let readDisposable = vscode.commands.registerCommand('code-to-speech.readCode', async () => {
        if (isSpeaking) {
            vscode.window.showWarningMessage('Already reading!');
            return;
        }

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        }

        isSpeaking = true;
        myStatusBarItem.text = `$(primitive-square) Stop`;
        myStatusBarItem.command = 'code-to-speech.stopReading';

        const lang = editor.document.languageId;
        if (!isMuted) {
            say.speak(`Starting ${lang} code review`);
        }

        const document = editor.document;
        for (let i = 0; i < document.lineCount; i++) {
            if (!isSpeaking) {
                break;
            }

            const line = document.lineAt(i);
            const text = line.text.trim();

            if (text.length > 0) {
                const range = new vscode.Range(i, 0, i, line.text.length);
                editor.setDecorations(highlightDecorationType, [range]);
                editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

                const config = vscode.workspace.getConfiguration('codeToSpeech');
                const speed = config.get<number>('speed') || 1.0;
                const voice = config.get<string>('voice');

                if (!isMuted) {
                    say.speak(text, voice, speed);
                }

                const estimatedMs = Math.max(1500, text.length * 80);
                await new Promise((resolve) => {
                    currentTimer = setTimeout(resolve, estimatedMs);
                });
            }
        }

        stopEverything();
    });


    let stopDisposable = vscode.commands.registerCommand('code-to-speech.stopReading', () => {
        stopEverything();
        vscode.window.showInformationMessage('Speech stopped.');
    });


    function stopEverything() {
        isSpeaking = false;
        say.stop();
        if (currentTimer) {
            clearTimeout(currentTimer);
            currentTimer = undefined;
        }
        myStatusBarItem.text = `$(play) Read Code`;
        myStatusBarItem.command = 'code-to-speech.readCode';
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            editor.setDecorations(highlightDecorationType, []);
        }
    }

    context.subscriptions.push(readDisposable, stopDisposable, muteDisposable);
}

export function deactivate() {}