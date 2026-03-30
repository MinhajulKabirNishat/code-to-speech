import * as vscode from 'vscode';
 import say = require('say');

export function activate(context: vscode.ExtensionContext) {
    
    let disposable = vscode.commands.registerCommand('code-to-speech.readCode', () => {
        const editor = vscode.window.activeTextEditor;

        if (editor) {
            const document = editor.document;
            const selection = editor.selection;
            
            
            const text = selection.isEmpty ? document.getText() : document.getText(selection);

            vscode.window.showInformationMessage('Reading your code out loud...');
            
     
            say.speak(text);
        } else {
            vscode.window.showErrorMessage('Open a code file first!');
        }
    });

 let stopDisposable = vscode.commands.registerCommand('code-to-speech.stopReading', () => {
        say.stop();
        vscode.window.showInformationMessage('Speech stopped.');
    });

    context.subscriptions.push(disposable);
    context.subscriptions.push(stopDisposable); 
    context.subscriptions.push(disposable);
}

export function deactivate() {
    say.stop(); 
}