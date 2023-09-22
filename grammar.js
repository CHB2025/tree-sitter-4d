const expressions = require("./expression");

// TODO: Add sql support
// TODO: Add formula support
// TODO: ternary expression
// TODO: Add support for Use expressions
module.exports = grammar({
    name: "FourD",
    //word: $ => $.identifier,
    extras: $ => [$.comment, "\t", "\v", " ",  /\\\r?\n/],
    rules: {
        source_file: $ => seq(repeat(prec(2, "\n")), optional($.method_declaration), repeat($._line)),
        _line: $ => seq(
            optional(choice(
                $._statement,
                $._control_structure,
                $._class_definitions,
                $._expression,
            )),
            "\n"
        ),
        _statement: $ => choice(
            $.assignment,
            $.variable_declaration,
            $.return,
        ),
        assignment: $ => seq(
            choice($._variable, $.field, $._accessor), 
            field("op", choice(":=", "*=", "+=", "-=", "/=")), 
            $._expression
        ),
        variable_declaration: $ => seq(
            token(prec(2, "var ")), 
            repeat(seq($._variable, ";")),
            $._variable, ":", $.type
        ),
        method_declaration: $ => prec.right(seq(
            "#DECLARE",
            "(",
            optional(field("params", seq(
                repeat(seq($.local_variable, ":", $.type, ";")),
                seq($.local_variable, ":", $.type)
            ))),
            ")",
            optional(seq(
                optional(seq("->", $.local_variable)),
                ":",
                $.type
            ))
        )),
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
            seq("cs", repeat1(/\.\w+/)),
            seq("4D", repeat1(/\.\w+/))
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
            "Case of", repeat1("\n"),
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

        // Classes
        _class_definitions: $ => choice(
            $.class_extends,
            $.class_constructor,
            $.class_property,
            $.class_function,
        ),
        class_extends: $ => seq(
            token(prec(2, "Class extends")),
            field("parent", seq(
                $.identifier,
                repeat(seq(
                    token.immediate("."),
                    $._immediate,
                ))
            ))
        ),
        class_constructor: $ => seq(
            token(prec(2, "Class constructor")),
            "(",
            optional(field("params", seq(
                repeat(seq(
                    $.local_variable,
                    ":",
                    $.type,
                    ";"
                )),
                $.local_variable,
                ":",
                $.type
            ))),
            ")"
        ),
        class_property: $ => seq(
            token(prec(2, "property ")),
            repeat(seq(
                $._attr, ";"
            )),
            $._attr,
            ":",
            $.type,
        ),
        class_function: $ => seq(
            token(prec(2, "Function ")),
            optional(choice("get", "set")),
            field('name', $._attr),
            "(",
            optional(field("params", seq(
                repeat(seq(
                    $.local_variable,
                    ":",
                    $.type,
                    ";"
                )),
                $.local_variable,
                ":",
                $.type
            ))),
            ")",
            optional(seq(
                optional(seq("->", $.local_variable)),
                ":",
                field("return_type", $.type)
            ))
        ),
        ...expressions,
    }
})
