module.exports = {
    _expression: $ => choice(
        $._literal,
        $.function_call,
        $.pointer,
        $._parentheses,
        $._accessor,
        $.binary_expression,
        $._variable,
        $.table,
        $.field,
    ),
    // TODO: Add support for object and collection literals
    _literal: $ => choice(
        $.string,
        $.boolean,
        $.number,
        $.date,
        $.time,
    ),
    string: _$ => /"(\\"|[^"\n])*"/,
    boolean: _$ => choice("True", "False"),
    number: _$ => /-?\d+(\.\d+)?/,
    date: _$ => /!\d\d\d\d-\d\d-\d\d!/,
    time: _$ => /\?\d\d:\d\d:\d\d\?/,

    // https://developer.4d.com/docs/Concepts/identifiers - Not entirely accurate. See ∞ excellent test method ∞
    identifier: _$ => /\w([\w ]*\w)?/,
    _immediate: $ => alias(token.immediate(/\w([\w ]*\w)?/), $.identifier),
    _variable: $ => choice(
        $.local_variable,
        $.process_variable,
        $.interprocess_variable,
    ),
    local_variable: $ => choice(
        seq("$", $._immediate),
        seq("$", token.immediate("{"), $._expression, token("}")),
    ),
    process_variable: $ => $.identifier,
    interprocess_variable: $ => seq("<>", $._immediate),


    table: $ => seq("[", $.identifier, "]"),
    field: $ => seq($.table, $._immediate),
    pointer: $ => prec.right(seq("->", $._expression)),
    function_call: $ => seq(
        field('name', $.identifier), "(", 
        optional(field("params", seq(
            repeat(seq($._fn_arg, ";")), 
            $._fn_arg,
        ))), 
        ")"
    ),
    _fn_arg: $ => choice($._expression, $.operator, $.assignment), // Assignment is needed for some builtin methods
    operator: _$ => field("op", token(choice(">", "<", "*"))), // necessary for some built-in methods
    _parentheses: $ => seq("(", $._expression, ")"),
    _accessor: $ => choice(
        $.pointer_access,
        $.object_access,
        $.member_function_call,
        $.collection_access,
        $.array_access,
    ),
    pointer_access: $ => seq(field("pointer", $._expression), "->"),
    object_access: $ => seq(
        field("object", $._expression), 
        token.immediate("."), 
        field("attribute", $._immediate)
    ),
    member_function_call: $ => seq(
        field("object", $._expression),
        token.immediate("."),
        field("method", $._immediate),
        token("("),
        optional(field("params", seq(
            optional(repeat(seq($._expression, ";"))),
            $._expression,
        ))),
        token(")"),
    ),
    collection_access: $ => seq(
        field("collection", $._expression), 
        token("["),
        field("item", $._expression),
        token("]"),
    ),
    array_access: $ => seq(
        field("array", $._expression), 
        token.immediate("{"), 
        field("item", $._expression), 
        token("}")
    ),
    binary_expression: $ => prec.left(seq(
        field("left", $._expression),
        field("op", choice(
            "+", "-", "/", "*",
            "&", "|", "=", "#",
            "&&", "||",
            ">", "<", ">=", "<=",
            "%", "^", "\^|",
            "<<", ">>", "?+", "?-", "??",
            "*+", "*|"
        )), 
        field("right", $._expression)
    )),


}
