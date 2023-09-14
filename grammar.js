const expressions = require("./expression");

module.exports = grammar({
    name: "FourD",
    word: $ => $._identifier,
    extras: $ => [$.comment, "\t", "\v", " ",  /\\\r?\n/],
    rules: {
        source_file: $ => seq(repeat(prec(2, "\n")), optional($.method_declaration), repeat($._line)),
        _line: $ => seq(
            optional(choice(
                $._statement,
                $._expression,
            )),
            "\n"
        ),
        _statement: $ => choice(
            $.assignment,
            $.variable_declaration,
            $._control_structure,
            $.return,
        ),
        ...expressions,
        assignment: $ => prec(2, seq(
            choice($._variable, $.field, $._accessor), 
            choice(":=", "*=", "+=", "-=", "/="), 
            $._expression
        )),
        variable_declaration: $ => seq(
            "var", 
            repeat(seq($._variable, ";")),
            $._variable, ":", $.type
        ),
        method_declaration: $ => seq(
            "#DECLARE",
            "(",
            optional(seq(
                repeat(seq($.local_variable, ":", $.type, ";")),
                seq($.local_variable, ":", $.type)
            )),
            ")",
            optional(seq("->", $.local_variable)),
            ":",
            $.type
        ),
        type: _$ => choice(
            "Text",
            "Date",
            "Time",
            "Boolean",
            "Integer",
            "Real",
            "Pointer",
            "Variant",
            "Picture",
            "Blob",
            "Object",
            "Collection",
            seq("cs.", /\w+/),
            seq("4D.", /\w+/)
        ),
        comment: _$ => choice(
            seq("//", /.*/),
            seq(
                "/*",
                /[^\*]*\*+([^/*][^*]*\*+)*/, // Not sure where I found this.
                "/"
            ),
        ),
        _control_structure: $ => choice(
            $.for,
            $.for_each,
            $.while,
            $.repeat,
            $.if,
            $.case,
        ),
        for: $ => seq(
            "For",
            "(",
            $._variable, ";",
            $._expression, ";",
            $._expression,
            ")", "\n",
            repeat($._line),
            "End for"
        ),
        for_each: $ => seq(
            "For each", "(", $._variable, ";", $._expression, 
            optional(seq(
                ";", $._expression, 
                optional(seq(
                    ";", $._expression,
                ))
            )), ")", optional(seq(
                choice("While", "Until"),
                "(", $._expression, ")",
            )), "\n",
            repeat($._line),
            "End for each"
        ),
        while: $ => seq(
            "While", "(", $._expression, ")", "\n",
            repeat($._line),
            "End while"
        ),
        repeat: $ => seq(
            "Repeat", "\n",
            repeat($._line),
            "Until", "(", $._expression, ")"
        ),
        if: $ => seq(
            "If",
            "(", $._expression, ")", "\n",
            repeat($._line),
            optional(seq(
                "Else", "\n",
                repeat($._line),
            )),
            "End if"
        ),
        case: $ => seq(
            "Case of", "\n",
            repeat(seq(
                ":", "(", $._expression, ")", "\n",
                repeat($._line),
            )),
            "End case"
        ),
        return: $ => seq(
            "return",
            optional($._expression),
        ),
    }
})
