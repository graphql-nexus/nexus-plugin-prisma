# Failed getConfig at 2019-08-16T13:04:27.837Z
## RPC Input One Line
```json
{"id":1,"jsonrpc":"2.0","method":"getConfig","params":{"projectInfo":"","datamodel":"\n    model User {\n      id    Int @id\n    }\n    "}}
```

## RPC Input Readable
```json
{
  "id": 1,
  "jsonrpc": "2.0",
  "method": "getConfig",
  "params": {
    "projectInfo": "",
    "datamodel": "\n    model User {\n      id    Int @id\n    }\n    "
  }
}
```


## RPC Response
```
null
```

## Stack Trace
```bash
thread 'main' panicked at 'called `Option::unwrap()` on a `None` value', src/libcore/option.rs:345:21
stack backtrace:
   0: std::sys::unix::backtrace::tracing::imp::unwind_backtrace
   1: std::sys_common::backtrace::_print
   2: std::panicking::default_hook::{{closure}}
   3: std::panicking::default_hook
   4: std::panicking::rust_panic_with_hook
   5: std::panicking::continue_panic_fmt
   6: rust_begin_unwind
   7: core::panicking::panic_fmt
   8: core::panicking::panic
   9: migration_engine::main
  10: std::rt::lang_start::{{closure}}
  11: std::panicking::try::do_call
  12: __rust_maybe_catch_panic
  13: std::rt::lang_start_internal
  14: main

```
