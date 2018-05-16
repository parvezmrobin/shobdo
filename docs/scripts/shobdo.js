class Compiler {

  constructor(source) {
    this.source = source;
  }

  compile() {
    const len = this.source.length;
    this.output = '';
    this.identifiers = {};
    this.line = 1;
    this.numVar = 0;

    for (let i = 0; i < len; i++) {
      const ch = this.source[i];

      if (ch === ' ' || ch === '\t') {
        this.output += ch;
      } else if (ch === '\n') {
        this.output += ch;
        this.line++;
      } else if (Compiler.isAlpha(ch)) {
        i = this.handleAlpha(i);
      } else if (Compiler.isNum(ch)) {
        i = this.handleNumber(i);
      } else if (ch === '"' || ch === "'") {
        i = this.handleString(i, this.source[i]);
      } else {
        this.output += ch;
      }
    }

    return this.output;
  }

  static isAlpha(ch) {
    return ch >= 'ঁ' && ch <= 'য়';
  }

  static isNum(ch) {
    return ch >= '০' && ch <= '৯';
  }

  static isAlphaNum(ch) {
    return Compiler.isAlpha(ch) || Compiler.isNum(ch);
  }

  handleNumber(i) {
    let j = i + 1;
    for (; j < this.source.length; j++) {
      if (!Compiler.isNum(this.source[j])) break;
    }
    if (this.source[j] === '.') {
      for (j++; j < this.source.length; j++) {
        if (!Compiler.isNum(this.source[j])) break;
      }
    }

    for (; i < j; i++) {
      this.output += (this.source[i] === '.') ? '.' : (this.source.charCodeAt(i) - 2534);
    }

    return j - 1; // as i will be incremented in for once
  }

  handleAlpha(i) {
    let j = this.retrieveAlphaNum(i + 1);

    const lexeme = this.source.substring(i, j);
    const isKeyword = Compiler.isKeyword(lexeme);
    if (isKeyword) {
      if (lexeme === "সকল") {
        return this.handleFor(i);
      }
      else {
        this.output += Compiler.keywords[lexeme];
      }
    } else {
      const identified = this.identified(lexeme);
      if (!identified) {
        this.identifiers[lexeme] = ("t" + this.numVar);
        this.numVar++;
      }

      this.output += this.identifiers[lexeme];
    }

    return j - 1; // as i will be incremented in for once
  }

  retrieveAlphaNum(j) {
    for (; j < this.source.length; j++) {
      if (!Compiler.isAlphaNum(this.source[j]))
        break;
    }
    return j;
  }

  static isKeyword(lexeme) {
    return lexeme in Compiler.keywords;
  }

  identified(lexeme) {
    return lexeme in this.identifiers;
  }

  handleFor(i) {
    let j = i + 3; // index next to "for"

    //Retrieve list name
    j = this.skipWhiteSpaces(j);
    let k = this.retrieveAlphaNum(j);
    const listName = this.source.substring(j, k);

    // Match এরমধ্যে
    j = this.skipWhiteSpaces(k);
    k = this.retrieveAlphaNum(j);
    const of = this.source.substring(j, k);
    if (of !== "এরমধ্যে") {
      throw `${this.line} এর কাছে ভুল`;
    }

    // Retrieve variable name
    j = this.skipWhiteSpaces(k);
    k = this.retrieveAlphaNum(j);
    const varName = this.source.substring(j, k);

    // Match এরজন্য
    j = this.skipWhiteSpaces(k);
    k = this.retrieveAlphaNum(j);
    const of1 = this.source.substring(j, k);
    if (of1 !== "এরজন্য") {
      throw `${this.line} এর কাছে ভুল`;
    }

    const varExists = this.identified(varName);
    if (varExists) {
      throw `${this.line} এর কাছে ভুল: ${varName} ইতিমধ্যে পরিচিত।`;
    }
    this.identifiers[varName] = "t" + this.numVar;
    const translatedVarName = this.identifiers[varName];
    this.numVar++;
    const listExists = this.identified(listName);
    if (!listExists) {
      throw `${this.line} এর কাছে ভুল: ${listName} পরিচিত নয়।`;
    }
    const translatedListName = this.identifiers[listName];

    this.output += `for (${Compiler.keywords["চলক"]} ${translatedVarName} of ${translatedListName})`;

    return k - 1;
  }

  skipWhiteSpaces(j) {
    while (this.source[j] === ' ' || this.source[j] === '\t') {
      j++;
    }
    return j;
  }

  handleString(i, delimeter = '"') {
    let j;
    for (j = i + 1; j < this.source.length; j++) {
      if (this.source[j] === delimeter) break;
    }

    this.output += this.source.substring(i, j + 1);

    return j;
  }
}

Compiler.keywords = {
  "চলক": "var",
  "যদি": "if",
  "অথবা": "else",
  "অথবাযদি": "else if",
  "যতক্ষণ": "while",
  "সকল": "for",
  "এরজন্য": "of",
  "সত্য": "true",
  "মিথ্যা": "false",
  "ও": "&&",
  "বা": "||",
  "দেখাও": "shobdo.util.show"
};
