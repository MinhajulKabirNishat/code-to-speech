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

    context.subscriptions.push(disposable);
}

export function deactivate() {
    say.stop(); 
}